import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TitleBar from './components/TitleBar';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import StatsScreen from './screens/StatsScreen';
import LobbyScreen from './screens/LobbyScreen';
import { socket } from './utils/socketClient';
import { getRandomLocations, getLocationsByCountry } from './data/locations';
import storage from './utils/storage';
import { LanguageProvider } from './contexts/LanguageContext';

const SCREENS = {
    HOME: 'home',
    GAME: 'game',
    RESULT: 'result',
    STATS: 'stats',
    LOBBY: 'lobby',
};

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

const PAGE_VARIANTS = {
    initial: { opacity: 0, scale: 0.985, filter: 'blur(4px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.01, filter: 'blur(4px)' },
};

const PAGE_TRANSITION = {
    duration: 0.35,
    ease: [0.4, 0, 0.2, 1],
};

export default function App() {
    const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
    const [gameSettings, setGameSettings] = useState({
        mode: 'classic',
        timerDuration: 60,
        roundCount: 5,
    });
    const [gameResult, setGameResult] = useState(null);
    const [lobbyData, setLobbyData] = useState(null);
    const [isMultiplayer, setIsMultiplayer] = useState(false);


    const handleStartGame = useCallback((settings) => {
        setGameSettings(settings);
        setIsMultiplayer(false);
        setCurrentScreen(SCREENS.GAME);
    }, []);

    const handleHostLobby = useCallback((settings) => {
        socket.connect();
        socket.emit('create_room', { settings, playerName: settings.playerName, playerColor: settings.playerColor }, (response) => {
            if (response.success) {
                setGameSettings(settings);
                setIsMultiplayer(true);
                setLobbyData({
                    roomId: response.roomId,
                    hostId: response.hostId,
                    players: response.players,
                    settings: settings
                });
                setCurrentScreen(SCREENS.LOBBY);
            }
        });
    }, []);

    const handleJoinLobby = useCallback(({ roomId, playerName, playerColor }) => {
        socket.connect();
        socket.emit('join_room', { roomId, playerName, playerColor }, (response) => {
            if (response.success) {
                setGameSettings(response.settings);
                setIsMultiplayer(true);
                setLobbyData({
                    roomId: response.roomId,
                    hostId: response.hostId,
                    players: response.players,
                    settings: response.settings
                });
                setCurrentScreen(SCREENS.LOBBY);
            } else {
                alert(response.message || 'Could not join lobby.');
            }
        });
    }, []);

    const handleMultiplayerGameStart = useCallback((data) => {
        if (data.intent === 'start' && lobbyData) {
            // Generate locations based on lobby settings
            const isWorldwide = !gameSettings.country || gameSettings.country === 'Dünya Geneli (Karışık)';
            const locations = isWorldwide
                ? getRandomLocations(gameSettings.roundCount)
                : getLocationsByCountry(gameSettings.country, gameSettings.roundCount);
            socket.emit('start_game', { roomId: lobbyData.roomId, roundLocations: locations });
        } else if (data.roundLocations) {
            // Game actually started locally
            setLobbyData(prev => ({ ...prev, roundLocations: data.roundLocations }));
            setCurrentScreen(SCREENS.GAME);
        }
    }, [lobbyData, gameSettings]);

    const handleLeaveLobby = useCallback(() => {
        setIsMultiplayer(false);
        setLobbyData(null);
        setCurrentScreen(SCREENS.HOME);
    }, []);

    const handleGameEnd = useCallback((result) => {
        setGameResult(result);
        setCurrentScreen(SCREENS.RESULT);
    }, []);

    const handlePlayAgain = useCallback(() => {
        setCurrentScreen(SCREENS.GAME);
    }, []);

    const handleGoHome = useCallback(() => {
        setCurrentScreen(SCREENS.HOME);
    }, []);

    const handleShowStats = useCallback(() => {
        setCurrentScreen(SCREENS.STATS);
    }, []);

    const handleQuitGame = useCallback(() => {
        if (isMultiplayer) {
            socket.emit('leave_room');
            socket.disconnect();
            setIsMultiplayer(false);
        }
        setCurrentScreen(SCREENS.HOME);
    }, [isMultiplayer]);

    return (
        <LanguageProvider>
            <div className="w-full h-full text-white bg-black flex flex-col overflow-hidden">
                {/* Only show TitleBar in Electron or desktop */}
                {isElectron && <TitleBar />}

                <div className="app-container flex-1 relative w-full overflow-hidden">
                    <AnimatePresence mode="wait">
                        {currentScreen === SCREENS.HOME && (
                            <motion.div
                                key="home"
                                variants={PAGE_VARIANTS}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={PAGE_TRANSITION}
                                className="h-full"
                            >
                                <HomeScreen
                                    onStartGame={handleStartGame}
                                    onShowStats={handleShowStats}
                                    onHostLobby={handleHostLobby}
                                    onJoinLobby={handleJoinLobby}

                                />
                            </motion.div>
                        )}

                        {currentScreen === SCREENS.GAME && (
                            <motion.div
                                key="game"
                                variants={PAGE_VARIANTS}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={PAGE_TRANSITION}
                                className="h-full"
                            >
                                <GameScreen
                                    gameSettings={gameSettings}
                                    onGameEnd={handleGameEnd}
                                    onQuit={handleQuitGame}
                                    isMultiplayer={isMultiplayer}
                                    roomId={isMultiplayer ? lobbyData?.roomId : null}
                                    multiplayerLocations={isMultiplayer ? lobbyData?.roundLocations : null}
                                    isHost={isMultiplayer ? lobbyData?.hostId === socket.id : false}

                                />
                            </motion.div>
                        )}

                        {currentScreen === SCREENS.RESULT && (
                            <motion.div
                                key="result"
                                variants={PAGE_VARIANTS}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={PAGE_TRANSITION}
                                className="h-full"
                            >
                                <ResultScreen
                                    gameData={gameResult}
                                    onPlayAgain={handlePlayAgain}
                                    onGoHome={handleGoHome}
                                    isMultiplayer={isMultiplayer}
                                />
                            </motion.div>
                        )}
                        {currentScreen === SCREENS.STATS && (
                            <motion.div
                                key="stats"
                                variants={PAGE_VARIANTS}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={PAGE_TRANSITION}
                                className="h-full"
                            >
                                <StatsScreen onBack={handleGoHome} />
                            </motion.div>
                        )}

                        {currentScreen === SCREENS.LOBBY && lobbyData && (
                            <motion.div
                                key="lobby"
                                variants={PAGE_VARIANTS}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={PAGE_TRANSITION}
                                className="h-full"
                            >
                                <LobbyScreen
                                    roomId={lobbyData.roomId}
                                    hostId={lobbyData.hostId}
                                    initialPlayers={lobbyData.players}
                                    initialSettings={lobbyData.settings}
                                    onGameStart={handleMultiplayerGameStart}
                                    onLeaveLobby={handleLeaveLobby}

                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </LanguageProvider>
    );
}
