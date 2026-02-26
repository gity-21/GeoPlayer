const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Healthcheck route for Render
app.get('/', (req, res) => {
    res.send('✓ GeoPlayer Server is running!');
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // allow all in dev
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Room states: waiting, playing, results
// rooms[id] = { id, hostId, players: [], settings: {}, state: 'waiting', currentRound: 0, roundStartPoints: [] }
const rooms = {};

const PLAYER_COLORS = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#eab308', // Yellow
    '#a855f7', // Purple
    '#f97316', // Orange
    '#ec4899', // Pink
    '#14b8a6'  // Teal
];

function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', (data, callback) => {
        const roomId = generateRoomId();
        rooms[roomId] = {
            id: roomId,
            hostId: socket.id,
            players: [{
                id: socket.id,
                name: data.playerName || 'Host',
                color: data.playerColor || PLAYER_COLORS[0],
                avatar: data.playerAvatar || '👽',
                score: 0,
                guess: null,
                hasGuessed: false,
                isReady: false,
                isEliminated: false
            }],
            settings: data.settings || {},
            state: 'waiting',
            currentRound: 0,
            roundLocations: []
        };

        socket.join(roomId);
        callback({ success: true, roomId, players: rooms[roomId].players, hostId: socket.id });
    });

    socket.on('join_room', (data, callback) => {
        const roomId = data.roomId.toUpperCase();
        const room = rooms[roomId];

        if (!room) {
            return callback({ success: false, message: 'Oda bulunamadı' });
        }

        if (room.state !== 'waiting') {
            return callback({ success: false, message: 'Oyun zaten başlamış' });
        }

        if (room.players.length >= 8) {
            return callback({ success: false, message: 'Oda dolu (Maks 8 kişi)' });
        }

        const assignedColor = data.playerColor || PLAYER_COLORS[room.players.length % PLAYER_COLORS.length];

        room.players.push({
            id: socket.id,
            name: data.playerName || `Oyuncu ${room.players.length + 1}`,
            color: assignedColor,
            avatar: data.playerAvatar || '👽',
            score: 0,
            guess: null,
            hasGuessed: false,
            isReady: false,
            isEliminated: false
        });

        socket.join(roomId);

        // Notify others in room
        io.to(roomId).emit('room_updated', {
            players: room.players,
            hostId: room.hostId,
            settings: room.settings
        });

        callback({ success: true, roomId, players: room.players, hostId: room.hostId, settings: room.settings });
    });

    socket.on('update_settings', (data) => {
        const room = rooms[data.roomId];
        if (room && room.hostId === socket.id) {
            room.settings = data.settings;
            room.roundLocations = data.roundLocations; // Pre-generated locations from host
            io.to(data.roomId).emit('room_updated', {
                players: room.players,
                hostId: room.hostId,
                settings: room.settings
            });
        }
    });

    socket.on('start_game', (data) => {
        const room = rooms[data.roomId];
        if (room && room.hostId === socket.id) {
            room.state = 'playing';
            room.currentRound = 1;
            room.roundLocations = data.roundLocations; // Receive X locations from host
            room.players.forEach(p => {
                p.isEliminated = false;
                p.score = 0;
                p.guess = null;
                p.hasGuessed = false;
            });

            io.to(data.roomId).emit('game_started', {
                settings: room.settings,
                roundLocations: room.roundLocations,
                players: room.players
            });
        }
    });

    socket.on('submit_guess', (data) => {
        const { roomId, guess, score, distance, timeSpent } = data;
        const room = rooms[roomId];

        if (room && room.state === 'playing') {
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                player.guess = guess || null; // Will keep null if timed out
                player.hasGuessed = true;
                player.lastScore = score || 0;
                player.lastDistance = distance || 20000;
                player.lastTimeSpent = timeSpent || 0;
                player.score += (score || 0);
            }

            // Check if all active players guessed
            const activePlayers = room.players.filter(p => !p.isEliminated);
            const allGuessed = activePlayers.every(p => p.hasGuessed);
            if (allGuessed) {
                // Battle Royale Logic
                if (room.settings.mode === 'battleroyale' && activePlayers.length > 1) {
                    activePlayers.sort((a, b) => {
                        if (a.lastScore !== b.lastScore) return a.lastScore - b.lastScore;
                        return b.lastDistance - a.lastDistance;
                    });
                    activePlayers[0].isEliminated = true; // eliminate lowest performer
                }

                // Broadcast results
                io.to(roomId).emit('round_results', {
                    players: room.players
                });
            } else {
                // Just notify that someone guessed (so UI can show ready tick)
                io.to(roomId).emit('player_guessed', {
                    playerId: socket.id,
                    allGuessed: false
                });
            }
        }
    });

    socket.on('times_up', (data) => {
        const { roomId } = data;
        const room = rooms[roomId];
        if (room && room.hostId === socket.id && room.state === 'playing') {
            // Battle Royale Logic
            const activePlayers = room.players.filter(p => !p.isEliminated);
            if (room.settings.mode === 'battleroyale' && activePlayers.length > 1) {
                activePlayers.sort((a, b) => {
                    const aScore = a.hasGuessed ? a.lastScore : -1;
                    const bScore = b.hasGuessed ? b.lastScore : -1;
                    if (aScore !== bScore) return aScore - bScore;
                    return (b.lastDistance || Number.MAX_VALUE) - (a.lastDistance || Number.MAX_VALUE);
                });
                activePlayers[0].isEliminated = true;
            }

            io.to(roomId).emit('round_results', {
                players: room.players
            });
        }
    });

    socket.on('next_round', (data) => {
        const room = rooms[data.roomId];
        if (room && room.hostId === socket.id) {
            room.currentRound++;
            // Reset guesses
            room.players.forEach(p => {
                p.guess = null;
                p.hasGuessed = false;
            });

            const activeCount = room.settings.mode === 'battleroyale' ? room.players.filter(p => !p.isEliminated).length : room.players.length;

            if (room.currentRound > room.settings.roundCount || (room.settings.mode === 'battleroyale' && activeCount <= 1)) {
                room.state = 'finished';
                io.to(data.roomId).emit('game_finished', { players: room.players });
            } else {
                io.to(data.roomId).emit('next_round_started', { roundNumber: room.currentRound });
            }
        }
    });

    socket.on('play_again', (data) => {
        const room = rooms[data.roomId];
        if (room && room.hostId === socket.id) {
            room.state = 'waiting';
            room.currentRound = 0;
            room.players.forEach(p => {
                p.score = 0;
                p.guess = null;
                p.hasGuessed = false;
                p.isEliminated = false;
            });
            io.to(data.roomId).emit('back_to_lobby', { players: room.players });
        }
    });

    socket.on('leave_room', (data) => {
        handleUserLeave(socket.id);
    });

    // Chat System
    socket.on('send_chat', (data) => {
        const { roomId, message, senderName, senderColor, senderAvatar } = data;
        const room = rooms[roomId];
        if (room) {
            io.to(roomId).emit('new_chat', {
                id: Math.random().toString(36).substr(2, 9),
                senderId: socket.id,
                senderName,
                senderColor,
                senderAvatar,
                message,
                timestamp: Date.now()
            });
        }
    });

    // Emoji Reactions
    socket.on('send_reaction', (data) => {
        const { roomId, emoji, senderName } = data;
        const room = rooms[roomId];
        if (room) {
            io.to(roomId).emit('new_reaction', {
                id: Math.random().toString(36).substr(2, 9),
                senderId: socket.id,
                senderName,
                emoji
            });
        }
    });

    socket.on('change_color', (data) => {
        const room = rooms[data.roomId];
        if (room && room.state === 'waiting') {
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                if (data.color && PLAYER_COLORS.includes(data.color)) {
                    player.color = data.color;
                } else {
                    const idx = PLAYER_COLORS.indexOf(player.color);
                    player.color = PLAYER_COLORS[(idx + 1) % PLAYER_COLORS.length] || PLAYER_COLORS[0];
                }
                io.to(data.roomId).emit('room_updated', {
                    players: room.players,
                    hostId: room.hostId,
                    settings: room.settings
                });
            }
        }
    });

    socket.on('change_avatar', (data) => {
        const room = rooms[data.roomId];
        if (room && room.state === 'waiting') {
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                if (data.avatar) {
                    player.avatar = data.avatar;
                }
                io.to(data.roomId).emit('room_updated', {
                    players: room.players,
                    hostId: room.hostId,
                    settings: room.settings
                });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        handleUserLeave(socket.id);
    });

    function handleUserLeave(socketId) {
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const playerIndex = room.players.findIndex(p => p.id === socketId);

            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                socket.leave(roomId);

                if (room.players.length === 0) {
                    delete rooms[roomId]; // remove empty room
                } else {
                    // If host left, assign new host
                    if (room.hostId === socketId) {
                        room.hostId = room.players[0].id;
                    }
                    io.to(roomId).emit('room_updated', {
                        players: room.players,
                        hostId: room.hostId,
                        settings: room.settings
                    });
                }
                break;
            }
        }
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
}).on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use (Background server running).`);
    } else {
        console.error('Server error:', e);
    }
});
