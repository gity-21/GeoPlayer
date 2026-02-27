import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StreetViewPanel from '../components/StreetViewPanel';
import GameMap from '../components/GameMap';
import ChatBox from '../components/ChatBox';
import EmojiReactions from '../components/EmojiReactions';
import { getRandomLocations, getLocationsByCountry } from '../data/locations';
import { haversineDistance, calculateScore } from '../utils/gameLogic';
import { socket } from '../utils/socketClient';
import storage from '../utils/storage';
import audioManager from '../utils/audioManager';
import { useLanguage } from '../contexts/LanguageContext';

export default function GameScreen({ gameSettings, onGameEnd, onQuit, isMultiplayer, roomId, multiplayerLocations, isHost }) {
    const [rounds, setRounds] = useState(() => {
        if (isMultiplayer && multiplayerLocations) {
            return multiplayerLocations;
        }
        return [];
    });
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(gameSettings.timerDuration);
    const [guessPosition, setGuessPosition] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [roundResults, setRoundResults] = useState([]);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [showRoundTransition, setShowRoundTransition] = useState(true);
    const [waitingForOthers, setWaitingForOthers] = useState(false);
    const [multiplayerRoundData, setMultiplayerRoundData] = useState(null);
    const [amIEliminated, setAmIEliminated] = useState(false);
    const [comboCount, setComboCount] = useState(0);
    const [showComboMessage, setShowComboMessage] = useState(false);
    const { language, t, translateCountry } = useLanguage();


    const timerRef = useRef(null);
    const handleSubmitGuessRef = useRef(null);

    // Initialize game
    useEffect(() => {
        if (!isMultiplayer) {
            const isWorldwide = !gameSettings.country || gameSettings.country === 'Dünya Geneli (Karışık)';
            const locations = isWorldwide
                ? getRandomLocations(gameSettings.roundCount)
                : getLocationsByCountry(gameSettings.country, gameSettings.roundCount);
            setRounds(locations);
        }
    }, [gameSettings.roundCount, gameSettings.country, isMultiplayer]);

    // Handle Multiplayer Initial Locations
    useEffect(() => {
        if (isMultiplayer && multiplayerLocations) {
            setRounds(multiplayerLocations);
        }
    }, [isMultiplayer, multiplayerLocations]);

    // Multiplayer socket events
    useEffect(() => {
        if (!isMultiplayer) return;

        const handlePlayerGuessed = (data) => {
            // we could show a toast or something if we want
            setTimeLeft(prev => prev > 12 ? 12 : prev);
        };

        const handleRoundResults = (data) => {
            setWaitingForOthers(false);
            setMultiplayerRoundData(data.players); // { id, name, guess, color, score }

            // Check newly eliminated for announcer
            if (multiplayerRoundData) {
                const previouslyEliminated = multiplayerRoundData.filter(p => p.isEliminated).length;
                const nowEliminated = data.players.filter(p => p.isEliminated).length;
                if (nowEliminated > previouslyEliminated) {
                    setTimeout(() => audioManager.speak('An agent was eliminated', 'en-US'), 1000);
                }
            }

            setShowResult(true);
            setIsMapExpanded(true);

            if (socket) {
                const me = data.players.find(p => p.id === socket.id);
                if (me && me.isEliminated) {
                    setAmIEliminated(true);
                }
            }

            // Generate our local result since it wasn't done locally before
            const actual = rounds[currentRoundIndex];
            if (!actual) return; // safety

            // Our personal guess is either guessPosition or null
            const myPlayer = data.players.find(p => p.id === socket.id);
            if (myPlayer) {
                const distance = myPlayer.guess
                    ? haversineDistance(myPlayer.guess.lat, myPlayer.guess.lng, actual.lat, actual.lng)
                    : 20000;

                const score = myPlayer.lastScore || 0;
                const result = {
                    round: currentRoundIndex + 1,
                    distance,
                    score,
                    guess: myPlayer.guess,
                    actual,
                };
                setRoundResults((prev) => [...prev, result]);

                // Combo logic
                if (distance < 100) {
                    setComboCount(prev => {
                        const newCombo = prev + 1;
                        if (newCombo >= 2) {
                            setShowComboMessage(true);
                            audioManager.playComboSound(newCombo);
                            setTimeout(() => setShowComboMessage(false), 2000);
                        }
                        return newCombo;
                    });
                } else {
                    setComboCount(0);
                }

                audioManager.playResultSound(score);
            }
        };

        const handleNextRoundStarted = (data) => {
            setCurrentRoundIndex((prev) => prev + 1);
            setGuessPosition(null);
            setShowResult(false);
            setIsMapExpanded(false);
            setShowRoundTransition(true);
            setMultiplayerRoundData(null);
        };

        const handleGameFinished = (data) => {
            // Wait a moment and finish
            setTimeout(() => {
                // prepare endgame
                const totalScore = roundResults.reduce((sum, r) => sum + r.score, 0);
                const totalDistance = roundResults.reduce((sum, r) => sum + r.distance, 0);

                const gameData = {
                    date: new Date().toISOString(),
                    totalScore,
                    totalDistance,
                    rounds: roundResults,
                    settings: gameSettings,
                    isMultiplayer: true,
                    multiplayerPlayers: data.players
                };

                // Save to storage
                storage.addGameToHistory(gameData);
                storage.addHighScore(gameData);
                storage.getProfile().then(profile => {
                    storage.updateProfile({
                        gamesPlayed: profile.gamesPlayed + 1,
                        totalScore: profile.totalScore + totalScore,
                        bestScore: Math.max(profile.bestScore, totalScore),
                    });
                });

                onGameEnd(gameData);
            }, 3000); // give them 3s to look at map
        };

        socket.on('player_guessed', handlePlayerGuessed);
        socket.on('round_results', handleRoundResults);
        socket.on('next_round_started', handleNextRoundStarted);
        socket.on('game_finished', handleGameFinished);

        return () => {
            socket.off('player_guessed', handlePlayerGuessed);
            socket.off('round_results', handleRoundResults);
            socket.off('next_round_started', handleNextRoundStarted);
            socket.off('game_finished', handleGameFinished);
        };
    }, [isMultiplayer, currentRoundIndex, rounds, roundResults, gameSettings, onGameEnd]);

    // Timer logic
    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(gameSettings.timerDuration);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (handleSubmitGuessRef.current) handleSubmitGuessRef.current();
                    return 0;
                }
                if (prev === 11) {
                    audioManager.speak('Time is running out', 'en-US');
                }
                if (prev <= 11 && prev > 1) {
                    audioManager.playTickTock();
                }
                return prev - 1;
            });
        }, 1000);
    }, [gameSettings.timerDuration]);

    useEffect(() => {
        if (!showRoundTransition && !showResult) {
            startTimer();
            audioManager.speak(`Round ${currentRoundIndex + 1}`, 'en-US');
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [showRoundTransition, showResult, startTimer]);

    const handleSubmitGuess = useCallback(() => {
        if (showResult || amIEliminated || waitingForOthers) return;
        if (!isMultiplayer && timerRef.current) clearInterval(timerRef.current);

        const actual = rounds[currentRoundIndex];
        const distance = guessPosition
            ? haversineDistance(guessPosition.lat, guessPosition.lng, actual.lat, actual.lng)
            : 20000; // Max distance if no guess

        const score = guessPosition ? calculateScore(distance) : 0;

        if (isMultiplayer) {
            // Emitting to server
            socket.emit('submit_guess', {
                roomId,
                guess: guessPosition,
                score,
                distance,
                timeSpent: gameSettings.timerDuration - timeLeft
            });
            setWaitingForOthers(true);
            setTimeLeft(prev => prev > 12 ? 12 : prev);
        } else {
            const result = {
                round: currentRoundIndex + 1,
                distance,
                score,
                guess: guessPosition,
                actual,
            };

            setRoundResults((prev) => [...prev, result]);

            // Single player combo logic
            if (distance < 100) {
                setComboCount(prev => {
                    const newCombo = prev + 1;
                    if (newCombo >= 2) {
                        setShowComboMessage(true);
                        audioManager.playComboSound(newCombo);
                        setTimeout(() => setShowComboMessage(false), 2000);
                    }
                    return newCombo;
                });
            } else {
                setComboCount(0);
            }

            audioManager.playResultSound(score);
            setShowResult(true);
            setIsMapExpanded(true);
        }
    }, [rounds, currentRoundIndex, guessPosition, showResult, isMultiplayer, roomId, gameSettings.timerDuration, timeLeft]);

    useEffect(() => {
        handleSubmitGuessRef.current = handleSubmitGuess;
    }, [handleSubmitGuess]);

    const handleNextRound = useCallback(() => {
        if (isMultiplayer) {
            if (isHost) {
                socket.emit('next_round', { roomId });
            }
        } else {
            if (currentRoundIndex + 1 >= gameSettings.roundCount) {
                // End game
                const totalScore = roundResults.reduce((sum, r) => sum + r.score, 0);
                const totalDistance = roundResults.reduce((sum, r) => sum + r.distance, 0);

                const gameData = {
                    date: new Date().toISOString(),
                    totalScore,
                    totalDistance,
                    rounds: roundResults,
                    settings: gameSettings,
                };

                // Save to storage
                storage.addGameToHistory(gameData);
                storage.addHighScore(gameData);
                storage.getProfile().then(profile => {
                    storage.updateProfile({
                        gamesPlayed: profile.gamesPlayed + 1,
                        totalScore: profile.totalScore + totalScore,
                        bestScore: Math.max(profile.bestScore, totalScore),
                    });
                });

                onGameEnd(gameData);
            } else {
                setCurrentRoundIndex((prev) => prev + 1);
                setGuessPosition(null);
                setShowResult(false);
                setIsMapExpanded(false);
                setShowRoundTransition(true);
            }
        }
    }, [currentRoundIndex, gameSettings, roundResults, onGameEnd, isMultiplayer, isHost, roomId]);

    if (rounds.length === 0) {
        return (
            <div className="h-full w-full bg-black flex flex-col items-center justify-center">
                <style>{`
                    @keyframes spin-slow { 100% { transform: rotate(360deg); } }
                `}</style>
                <div className="w-16 h-16 border-4 border-white/10 border-t-brand-primary rounded-full mb-6" style={{ animation: 'spin-slow 1.2s linear infinite' }} />
                <h3 className="text-white/60 font-bold tracking-[0.3em] text-sm uppercase font-display animate-pulse">
                    {t('loading')}
                </h3>
            </div>
        );
    }

    const myPlayer = isMultiplayer ? multiplayerRoundData?.find(p => p.id === socket.id) : null;
    const currentRoundLocation = rounds[currentRoundIndex];

    const handleSendEmoji = (emoji) => {
        if (!isMultiplayer) return;
        socket.emit('send_reaction', {
            roomId,
            emoji,
            senderName: myPlayer ? myPlayer.name : 'Agent'
        });
    }

    return (
        <div className="h-full w-full relative flex overflow-hidden bg-black">
            {isMultiplayer && <EmojiReactions roomId={roomId} isMultiplayer={isMultiplayer} />}
            {isMultiplayer && myPlayer && (
                <ChatBox
                    roomId={roomId}
                    playerName={myPlayer.name || 'Agent'}
                    playerColor={myPlayer.color || '#fff'}
                    isGameScreen={true}
                />
            )}

            {/* Main Street View Area */}
            <div className="flex-grow h-full relative">
                <StreetViewPanel
                    location={currentRoundLocation}
                    roundNumber={currentRoundIndex + 1}
                    showResult={showResult}
                    result={roundResults[roundResults.length - 1]}
                    mode={gameSettings?.mode}
                />

                {/* Top UI Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30 pointer-events-none">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="glass px-5 py-3 rounded-2xl flex items-center gap-4 pointer-events-auto"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('round')}</span>
                            <span className="text-xl font-bold font-display">{currentRoundIndex + 1} / {gameSettings.roundCount}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('totalScore')}</span>
                            <span className="text-xl font-bold font-display text-white/70">
                                {roundResults.reduce((sum, r) => sum + r.score, 0)}
                            </span>
                        </div>
                    </motion.div>

                    {amIEliminated && !showResult && (
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-red-500/10 border border-red-500/50 px-6 py-3 rounded-3xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.3)] pointer-events-auto backdrop-blur-md absolute left-1/2 -translate-x-1/2 mt-2 z-50"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            <span className="text-red-500 font-black tracking-[0.2em] text-sm text-center uppercase">{t('eliminatedSpectator')}</span>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {showComboMessage && (
                            <motion.div
                                initial={{ scale: 0.5, y: -20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="absolute top-24 right-1/2 translate-x-1/2 pointer-events-none z-[100] flex flex-col items-center"
                            >
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-70 mb-1" style={{ color: `hsl(${(comboCount * 40) % 360}, 100%, 70%)` }}>
                                    {comboCount}x {t('comboLabel')}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black italic drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ color: `hsl(${(comboCount * 40) % 360}, 100%, 70%)` }}>
                                    {t('perfectGuess')}
                                </h1>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={`glass px-6 py-3 h-[68px] rounded-2xl flex flex-col items-center justify-center pointer-events-auto ${timeLeft <= 10 ? 'border-red-500/50 text-red-400' : ''}`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                {t('timeLabel')}
                            </span>
                            <span className="text-2xl font-mono font-bold leading-none">{timeLeft}</span>
                        </motion.div>

                    </div>
                </div>
            </div>

            {/* Interactive Map Overlay (Mini-map moved to left) */}
            <div
                className={`absolute z-40 mini-map-container transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${showResult
                    ? 'top-1/2 -translate-y-1/2 left-12 w-[900px] h-[700px] shadow-[0_0_80px_rgba(0,0,0,0.6)]'
                    : isMapExpanded
                        ? 'bottom-6 left-6 w-[480px] h-[360px]'
                        : 'bottom-6 left-6 w-64 h-48 hover:w-72 hover:h-52'
                    }`}
                onMouseEnter={() => !showResult && setIsMapExpanded(true)}
                onMouseLeave={() => !showResult && setIsMapExpanded(false)}
            >
                <div className="w-full h-full glass rounded-[32px] overflow-hidden shadow-2xl border-white/10 flex flex-col">
                    <div className="flex-grow relative">
                        <GameMap
                            onMapClick={setGuessPosition}
                            guessPosition={guessPosition}
                            actualPosition={showResult ? currentRoundLocation : null}
                            showResult={showResult}
                            disabled={showResult || waitingForOthers || amIEliminated}
                            isExpanded={isMapExpanded}
                            roundLocations={gameSettings.country && gameSettings.country !== 'Dünya Geneli (Karışık)' ? rounds : null}
                            multiplayerData={showResult ? multiplayerRoundData : null}
                        />

                        {!showResult && (
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <div className="glass px-3 py-1.5 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-tighter">
                                    {t('placeGuess')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Center Buttons (Guess) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[45] flex flex-col items-center pointer-events-none">
                <AnimatePresence>
                    {!showResult && (
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            disabled={!guessPosition || amIEliminated || waitingForOthers}
                            onClick={handleSubmitGuess}
                            className={`pointer-events-auto px-16 py-5 rounded-full font-black tracking-[0.3em] transition-all duration-300 ${guessPosition && !amIEliminated && !waitingForOthers
                                ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95'
                                : 'bg-white/5 text-white/20 border border-white/5 backdrop-blur-sm pointer-events-none'
                                }`}
                        >
                            {amIEliminated ? t('spectator') : waitingForOthers ? t('waitingPlayers') : t('submitGuess')}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Quit Button */}
            <button
                onClick={onQuit}
                className="absolute top-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-xl text-xs font-bold text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all z-30"
            >
                {t('quitGame')}
            </button>





            <AnimatePresence>
                {showRoundTransition && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="text-center"
                        >
                            <span className="text-white/70 font-bold tracking-[0.3em] uppercase mb-4 block">
                                {t('areYouReady')}
                            </span>
                            <h2 className="text-8xl font-black font-display mb-8">
                                {t('round')} {currentRoundIndex + 1}
                            </h2>
                            <button
                                onClick={() => setShowRoundTransition(false)}
                                className="px-16 py-5 rounded-full outline-none bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 font-black tracking-[0.3em] text-2xl transition-all"
                            >
                                {t('start')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Post-Guess Result Overlay (mimicking start screen) */}
            <AnimatePresence>
                {showResult && roundResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[35] flex items-center justify-end pr-[10%] bg-black/85 backdrop-blur-sm pointer-events-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, x: 50 }}
                            animate={{ scale: 1, opacity: 1, x: 0 }}
                            transition={{ type: "spring", damping: 20, delay: 0.1 }}
                            className="text-center flex flex-col items-center max-w-xl"
                        >
                            <span className="text-white/40 font-bold tracking-[0.5em] uppercase mb-4 block">
                                {translateCountry(roundResults[roundResults.length - 1].actual.country)}
                            </span>
                            <h2 className="text-6xl md:text-8xl font-black font-display mb-12 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] leading-none">
                                {roundResults[roundResults.length - 1].actual.city}
                            </h2>

                            <div className="flex gap-12 justify-center mb-10 px-8 py-6 rounded-3xl bg-white/[0.03] border border-white/5 shadow-xl">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3">{t('distanceLabel')}</span>
                                    <span className="text-4xl md:text-5xl font-black font-mono text-white">
                                        {roundResults[roundResults.length - 1].distance < 1
                                            ? Math.round(roundResults[roundResults.length - 1].distance * 1000) + ' m'
                                            : Math.round(roundResults[roundResults.length - 1].distance) + ' km'}
                                    </span>
                                </div>
                                <div className="w-[1px] bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3">{t('score')}</span>
                                    <span className="text-4xl md:text-5xl font-black font-mono text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                                        +{roundResults[roundResults.length - 1].score}
                                    </span>
                                </div>
                            </div>

                            {roundResults[roundResults.length - 1].actual.funFact && (
                                <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-2xl p-4 mb-10 text-left max-w-xl mx-auto shadow-[0_0_20px_rgba(124,92,252,0.1)]">
                                    <div className="flex items-start gap-3">
                                        <div className="text-xl pt-1">💡</div>
                                        <div>
                                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest block mb-1">{t('didYouKnow')}</span>
                                            <p className="text-white/80 text-sm italic font-medium leading-relaxed">
                                                {language === 'EN'
                                                    ? (roundResults[roundResults.length - 1].actual.funFactEN || roundResults[roundResults.length - 1].actual.funFact)
                                                    : roundResults[roundResults.length - 1].actual.funFact}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isMultiplayer && multiplayerRoundData && (
                                <div className="w-full max-w-lg mx-auto mb-10 flex flex-col gap-2 relative z-50">
                                    <h3 className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                                        {t('otherAgents')}
                                    </h3>
                                    {multiplayerRoundData.sort((a, b) => b.lastScore - a.lastScore).map(p => (
                                        <div key={p.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/5 relative group cursor-pointer transition-all hover:bg-white/10 hover:border-white/20">
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ backgroundColor: p.color }} />
                                            <div className="pl-4 font-bold text-white/80 flex items-center gap-3">
                                                <span>{p.name}</span>
                                                {p.isEliminated && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-widest border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">{t('eliminated')}</span>}
                                            </div>
                                            <div className="font-mono font-black text-emerald-400">+{p.lastScore || 0} {t('pts')}</div>

                                            {/* Hover Tooltip */}
                                            <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-max bg-[#0a0a0a] px-4 py-3 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-4">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">{t('distance')}</span>
                                                    <span className="font-mono text-white text-lg font-black">{Math.round(p.lastDistance || 0)} {p.lastDistance < 1 ? 'm' : 'km'}</span>
                                                </div>
                                                <div className="w-[1px] h-6 bg-white/10" />
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">{t('roundScore')}</span>
                                                    <span className="font-mono text-emerald-400 text-lg font-black">+{p.lastScore || 0}</span>
                                                </div>
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-[#0a0a0a]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isMultiplayer && (
                                <div className="flex gap-4 mb-8">
                                    {['🤯', '🎯', '😭', '🔥', '💀', '👽'].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleSendEmoji(emoji)}
                                            className="text-3xl hover:scale-125 active:scale-90 transition-all drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {(!isMultiplayer || isHost) ? (
                                <button
                                    onClick={handleNextRound}
                                    className="w-full py-6 rounded-full font-black tracking-[0.3em] uppercase bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all text-xl"
                                >
                                    {currentRoundIndex + 1 < gameSettings.roundCount ? t('nextRound') : t('seeResults')}
                                </button>
                            ) : (
                                <div className="w-full py-6 rounded-full font-black tracking-[0.2em] uppercase border border-white/10 text-white/40 text-sm">
                                    {t('waitingForHost')}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Waiting for players overlay */}
            <AnimatePresence>
                {waitingForOthers && !showResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[49] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
                    >
                        <div className="glass px-10 py-8 rounded-[32px] flex flex-col items-center justify-center border-brand-primary/20 shadow-[0_0_60px_rgba(124,92,252,0.1)]">
                            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-6" />
                            <h2 className="text-2xl font-black font-display text-white tracking-widest mb-2">{t('guessSubmitted')}</h2>
                            <p className="text-white/40 font-mono text-sm tracking-widest uppercase">{t('waitingPlayers')}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
