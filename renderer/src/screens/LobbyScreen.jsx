import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../utils/socketClient';
import ChatBox from '../components/ChatBox';
import RotatingGlobe from '../components/RotatingGlobe';
import { useLanguage } from '../contexts/LanguageContext';

export default function LobbyScreen({ roomId, hostId, initialPlayers, initialSettings, onGameStart, onLeaveLobby }) {
    const [players, setPlayers] = useState(initialPlayers || []);
    const [settings, setSettings] = useState(initialSettings || {});
    const [isHost, setIsHost] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const { language, t, translateCountry } = useLanguage();
    const PLAYER_COLORS = [
        '#ef4444', '#3b82f6', '#22c55e', '#eab308',
        '#a855f7', '#f97316', '#ec4899', '#14b8a6'
    ];



    useEffect(() => {
        setIsHost(socket.id === hostId);
    }, [hostId, socket.id]);

    useEffect(() => {
        const handleRoomUpdated = (data) => {
            setPlayers(data.players);
            if (data.hostId) setIsHost(socket.id === data.hostId);
            if (data.settings) setSettings(data.settings);
        };

        const handleGameStarted = (data) => {
            onGameStart(data);
        };

        socket.on('room_updated', handleRoomUpdated);
        socket.on('game_started', handleGameStarted);

        return () => {
            socket.off('room_updated', handleRoomUpdated);
            socket.off('game_started', handleGameStarted);
        };
    }, [onGameStart]);

    const handleStartClick = () => {
        if (!isHost) return;

        // Generate round locations before starting
        // Or in this case we'll do that before calling start_game
        // We'll let `App.jsx` handle the location generation?
        // Let's pass the intent to `App.jsx` or handle it here
        onGameStart({ intent: 'start' });
    };

    const handleLeave = () => {
        socket.emit('leave_room');
        onLeaveLobby();
    };

    const me = players.find(p => p.id === socket?.id) || {};

    return (
        <div className="flex w-full h-full relative overflow-hidden z-0 bg-black">
            {/* Background Globe & Decoration */}
            <div className="absolute inset-0 flex items-center justify-center -z-20 pointer-events-none opacity-30">
                <div className="w-[180vw] h-[180vw] md:w-[130vw] md:h-[130vw] lg:w-[100vw] lg:h-[100vw] max-w-[1200px] max-h-[1200px] flex items-center justify-center mix-blend-screen transition-all duration-1000">
                    <RotatingGlobe />
                </div>
            </div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] -z-10 pointer-events-none" />



            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full h-full overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl glass p-6 md:p-8 rounded-[32px] border-white/10 mt-8 mb-24 md:mb-0"
                >
                    <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-white/10">
                        <div>
                            <h2 className="text-3xl font-black font-display tracking-widest text-white mb-1">
                                {t('lobbyCode')}: <span className="text-brand-primary">{roomId}</span>
                            </h2>
                            <p className="text-xs font-mono text-white/40 uppercase tracking-[0.2em]">
                                {t('shareCode')}
                            </p>
                        </div>
                        <button
                            onClick={handleLeave}
                            className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors font-bold tracking-widest text-xs uppercase"
                        >
                            {t('leaveLobby')}
                        </button>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-white/50 tracking-[0.2em] mb-4">{t('players')} ({players.length}/8)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {players.map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 relative"
                                    >
                                        <div
                                            className={`w-4 h-full absolute left-0 top-0 rounded-l-xl ${p.id === socket.id ? 'cursor-pointer hover:w-6 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all' : ''}`}
                                            style={{ backgroundColor: p.color }}
                                            onClick={() => {
                                                if (p.id === socket.id) {
                                                    setShowColorPicker(!showColorPicker);
                                                }
                                            }}
                                            title={p.id === socket.id ? "Pick Your Color" : ""}
                                        >
                                            {p.id === socket.id && (
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                                    <svg className="w-3 h-3 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                </div>
                                            )}
                                        </div>

                                        {p.id === socket.id && showColorPicker && (
                                            <div className="absolute top-[calc(100%+12px)] left-0 z-50 glass border border-white/10 rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] grid grid-cols-4 gap-3 w-max">
                                                {PLAYER_COLORS.map(c => (
                                                    <button
                                                        key={c}
                                                        className={`w-10 h-10 rounded-full border-2 transition-all shadow-lg hover:scale-110 active:scale-95 ${p.color === c ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'border-white/10 hover:border-white/50'}`}
                                                        style={{ backgroundColor: c }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            socket.emit('change_color', { roomId, color: c });
                                                            setShowColorPicker(false);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div className="ml-4 flex-1 overflow-hidden">
                                            <div className="text-lg font-bold text-white tracking-widest truncate">{p.name}</div>
                                            {p.id === hostId && (
                                                <div className="text-[10px] text-brand-primary uppercase font-black uppercase tracking-widest">{t('host')}</div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 mt-6 md:mt-0">
                        <div className="flex flex-col md:flex-row gap-4 md:items-center">
                            <div className="flex-1 text-xs text-white/40 uppercase font-mono mt-2 text-center md:text-left">
                                {`${t('settingsSummary')}: ${settings.timerDuration}s - ${settings.roundCount} ${t('rounds')} - ${translateCountry(settings.country)}`}
                            </div>
                            {isHost ? (
                                <button
                                    onClick={handleStartClick}
                                    disabled={players.length < 1} // Can test alone
                                    className="px-8 py-4 bg-emerald-500 text-black font-black hover:scale-105 active:scale-95 transition-all rounded-xl tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {t('hostStartBtn')}
                                </button>
                            ) : (
                                <div className="px-8 py-4 border border-white/10 rounded-xl text-white/50 font-bold uppercase tracking-widest">
                                    {t('waitingForHost')}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ChatBox Component */}
            <ChatBox roomId={roomId} playerName={me.name || 'Unknown'} playerColor={me.color || '#fff'} />
        </div>
    );
}
