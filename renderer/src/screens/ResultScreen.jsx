import React from 'react';
import { motion } from 'framer-motion';
import { getScoreRating } from '../utils/gameLogic';
import GameMap from '../components/GameMap';
import { useLanguage } from '../contexts/LanguageContext';

// Clean, well-crafted SVG icons for each score tier
const ScoreIcon = ({ color, tier }) => {
    // BAD → Sad face with tear
    if (tier === 'bad') {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 flex items-center justify-center"
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Face circle */}
                    <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.5" fill={color + '18'} />
                    {/* Dot eyes */}
                    <circle cx="9" cy="10" r="1" fill={color} />
                    <circle cx="15" cy="10" r="1" fill={color} />
                    {/* Sad mouth — curves downward */}
                    <path d="M8.5 15 C9.5 13.5 14.5 13.5 15.5 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    {/* Single tear */}
                    <path d="M9 11.5 L8.5 13.5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                </svg>
            </motion.div>
        );
    }

    // OKAY → Flat line mouth
    if (tier === 'okay') {
        return (
            <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 flex items-center justify-center"
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.5" fill={color + '18'} />
                    <circle cx="9" cy="10" r="1" fill={color} />
                    <circle cx="15" cy="10" r="1" fill={color} />
                    {/* Flat / neutral mouth */}
                    <line x1="9" y1="15" x2="15" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </motion.div>
        );
    }

    // DECENT → Small smile
    if (tier === 'decent') {
        return (
            <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 flex items-center justify-center"
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.5" fill={color + '18'} />
                    <circle cx="9" cy="10" r="1" fill={color} />
                    <circle cx="15" cy="10" r="1" fill={color} />
                    {/* Small upward curve */}
                    <path d="M9.5 14.5 C10.5 16 13.5 16 14.5 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
            </motion.div>
        );
    }

    // GOOD → Happy face with arc eyes
    if (tier === 'good') {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="w-20 h-20 flex items-center justify-center"
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.5" fill={color + '18'} />
                    {/* Happy arc eyes */}
                    <path d="M8 9.5 C8.5 8.5 9.5 8.5 10 9.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M14 9.5 C14.5 8.5 15.5 8.5 16 9.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    {/* Big smile */}
                    <path d="M8 13.5 C9 16.5 15 16.5 16 13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
            </motion.div>
        );
    }

    // GREAT → Excited wide eyes
    if (tier === 'great') {
        return (
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 12 }}
                className="w-20 h-20 flex items-center justify-center"
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.5" fill={color + '18'} />
                    {/* Wide circle eyes */}
                    <circle cx="9" cy="10" r="1.8" stroke={color} strokeWidth="1.2" fill="none" />
                    <circle cx="15" cy="10" r="1.8" stroke={color} strokeWidth="1.2" fill="none" />
                    {/* Pupils */}
                    <circle cx="9.5" cy="9.5" r="0.6" fill={color} />
                    <circle cx="15.5" cy="9.5" r="0.6" fill={color} />
                    {/* Joy smile */}
                    <path d="M8.5 14 C9.5 16.5 14.5 16.5 15.5 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
            </motion.div>
        );
    }

    // AMAZING / PERFECT → Crown
    return (
        <motion.div
            initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="w-20 h-20 flex items-center justify-center"
        >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Crown body */}
                <path
                    d="M4 17 L4 13 L8 9 L12 14 L16 9 L20 13 L20 17 Z"
                    fill={color + '28'}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                {/* Base bar */}
                <rect x="4" y="17" width="16" height="2" rx="1" fill={color} />
                {/* Gem dots — inside crown body area */}
                <circle cx="9" cy="14" r="0.9" fill={color} />
                <circle cx="12" cy="15.5" r="0.9" fill={color} />
                <circle cx="15" cy="14" r="0.9" fill={color} />
                {/* Top sparkle */}
                <path d="M12 4 L12.4 5.8 L14 6 L12.4 6.2 L12 8 L11.6 6.2 L10 6 L11.6 5.8 Z" fill={color} />
            </svg>
        </motion.div>
    );
};

export default function ResultScreen({ gameData, onPlayAgain, onGoHome, isMultiplayer }) {
    const { language, t, translateCountry } = useLanguage();
    const rating = getScoreRating(gameData.totalScore, gameData.settings.roundCount, language);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-black overflow-y-auto custom-scrollbar">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl glass rounded-[32px] p-6 md:p-8 flex flex-col items-center text-center relative my-2"
            >
                {/* Score Header */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-5 shrink-0"
                >
                    <div className="flex justify-center mb-3">
                        <ScoreIcon color={rating.color} tier={rating.icon} />
                    </div>
                    <div className="text-white/60 font-bold tracking-[0.4em] uppercase text-xs mb-2">
                        {gameData.settings.playerName || 'AGENT'}
                    </div>
                    <h2 className="text-lg font-bold tracking-[0.2em] text-white/40 uppercase mb-1">
                        {isMultiplayer ? t('gameResultMulti') : t('gameResult')}
                    </h2>
                    <h1 className="text-7xl md:text-8xl font-black font-display text-white mb-2 leading-none">
                        {gameData.totalScore.toLocaleString()}
                    </h1>
                    <div
                        className="inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-widest"
                        style={{ backgroundColor: rating.color + '20', color: rating.color, border: `1px solid ${rating.color}40` }}
                    >
                        {rating.label}
                    </div>
                </motion.div>

                {/* Map Section */}
                {isMultiplayer && gameData.multiplayerPlayers ? (
                    <div className="w-full flex flex-col mb-5 relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]" style={{ minHeight: 280, maxHeight: 380 }}>
                        <div className="absolute top-0 left-0 right-0 z-[1000] p-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                            <h3 className="text-white/80 font-bold uppercase tracking-widest text-xs text-center">
                                {t('lobbyLeaderboard')}
                            </h3>
                        </div>

                        <div className="flex-grow w-full relative pointer-events-auto" style={{ height: 220 }}>
                            <GameMap
                                disabled={true}
                                allRoundsData={gameData.rounds}
                                multiplayerData={gameData.multiplayerPlayers}
                                showResult={true}
                            />
                        </div>

                        {/* Leaderboard overlay */}
                        <div className="absolute bottom-0 left-0 right-0 z-[1000] flex flex-wrap justify-center gap-2 p-3 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none max-h-[55%] overflow-y-auto custom-scrollbar">
                            {[...gameData.multiplayerPlayers]
                                .sort((a, b) => b.score - a.score)
                                .map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                        className="bg-[#0a0a0a]/80 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between border border-white/10 relative overflow-hidden pointer-events-auto shadow-lg flex-1 min-w-[160px]"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: p.color }} />
                                        <div className="flex items-center gap-2 pl-3">
                                            <span className="font-bold text-white/50">{idx + 1}.</span>
                                            <span className="text-xs font-bold text-white tracking-widest truncate max-w-[100px]">{p.name}</span>
                                        </div>
                                        <div className="px-2 flex flex-col items-end">
                                            <span className="text-[9px] uppercase font-bold text-white/40 tracking-widest leading-none">{t('score')}</span>
                                            <span className="text-sm font-black font-mono text-emerald-400">
                                                {p.score.toLocaleString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex flex-col mb-5 relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]" style={{ minHeight: 260, maxHeight: 360 }}>
                        <GameMap
                            disabled={true}
                            allRoundsData={gameData.rounds}
                        />
                        {/* Round score pills */}
                        <div className="absolute bottom-3 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
                            <div className="glass px-4 py-2 rounded-full inline-flex gap-3 flex-wrap max-w-full mx-3">
                                {gameData.rounds.map((round, idx) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-white/50">R{idx + 1}</span>
                                        <span className="text-xs font-mono font-black text-white/80">{round.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-5 shrink-0">
                    <button
                        onClick={onPlayAgain}
                        className="btn-primary flex-grow py-4 text-base tracking-widest"
                    >
                        {t('playAgain')}
                    </button>
                    <button
                        onClick={onGoHome}
                        className="btn-secondary flex-grow py-4 text-base tracking-widest"
                    >
                        {t('backToHome')}
                    </button>
                </div>

                {/* Bottom stats — shrink-0 so it doesn't get clipped */}
                <div className="shrink-0 w-full flex justify-between px-2 border-t border-white/5 pt-4 opacity-25 font-mono text-[9px] tracking-tighter uppercase gap-2 overflow-hidden">
                    <span className="truncate">{t('levelPro')}</span>
                    <span className="shrink-0">{t('modeLabel')} {gameData.settings.mode?.toUpperCase()}</span>
                    <span className="truncate text-right">{new Date(gameData.date || Date.now()).toLocaleString('en-US')}</span>
                </div>
            </motion.div>
        </div>
    );
}
