import React from 'react';
import { motion } from 'framer-motion';
import { getScoreRating } from '../utils/gameLogic';
import GameMap from '../components/GameMap';

const AnimatedRadarLogo = ({ color, label }) => {
    // Return different SVG icons based on the final rating
    // Instead of completely relying on string matching which might be localized,
    // we use the color hash from the gameLogic which maps directly to score tiers

    // Top tier (e.g., green / yellow / gold) -> Crown
    if (color === '#ef4444' || label === 'Berbat' || label === 'Çok Kötü') {
        // Crying face for bad scores
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 flex items-center justify-center mb-2"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-20 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 9.05v-.1"></path>
                    <path d="M16 9.05v-.1"></path>
                    <path d="M16 16c-1.5-1.5-3.5-1.5-5.5-1.5T5 16"></path>
                    <path d="M8 12c0 1.5-1 3-2 3s-2-1.5-2-3"></path>
                    <path d="M16 12c0 1.5 1 3 2 3s2-1.5 2-3"></path>
                    <path d="M9 13.5l.5.5"></path>
                    <path d="M14.5 13.5l-.5.5"></path>
                </svg>
            </motion.div>
        );
    }

    // Mid tier -> Cool Glasses
    if (color === '#f97316' || color === '#eab308' || label === 'Ortalama' || label === 'İyi') {
        return (
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-24 h-24 flex items-center justify-center mb-2"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-20 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 9.05v-.1"></path>
                    <path d="M16 9.05v-.1"></path>
                    <path d="M8 14c1.5 1.5 3.5 1.5 5.5 1.5s4-1.5 4-1.5"></path>
                    <path d="M4 11h16"></path>
                    <path d="M16 11c0 2 1.5 3.5 3 3.5s3-1.5 3-3.5"></path>
                    <path d="M8 11C8 13 6.5 14.5 5 14.5S2 13 2 11"></path>
                </svg>
            </motion.div>
        );
    }

    // Top tier (Excellent / Perfect) -> Crown
    return (
        <motion.div
            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="w-28 h-28 flex items-center justify-center mb-2"
        >
            <svg viewBox="0 0 24 24" fill={color + '40'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-24 h-24 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                <path d="M2 4l3 12h14l3-12-6 7-4-11-4 11z"></path>
                <path d="M12 2v2"></path>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="8" y1="18" x2="8" y2="22"></line>
                <line x1="16" y1="18" x2="16" y2="22"></line>
                <line x1="4" y1="22" x2="20" y2="22"></line>
            </svg>
        </motion.div>
    );
};

export default function ResultScreen({ gameData, onPlayAgain, onGoHome, isMultiplayer }) {
    const rating = getScoreRating(gameData.totalScore, gameData.settings.roundCount);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black overflow-y-auto">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl glass rounded-[40px] p-10 flex flex-col items-center text-center relative overflow-hidden flex-1 max-h-full"
            >
                {/* Score Header */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 shrink-0"
                >
                    <div className="flex justify-center mb-2">
                        <AnimatedRadarLogo color={rating.color} label={rating.label} />
                    </div>
                    <div className="text-white/70 font-bold tracking-[0.4em] uppercase text-xs mb-3">
                        TEBRİKLER {gameData.settings.playerName || 'GEZGİN'}
                    </div>
                    <h2 className="text-2xl font-bold tracking-[0.2em] text-white/40 uppercase mb-2">OYUN TAMAMLANDI</h2>
                    <h1 className="text-8xl font-black font-display text-white mb-2 leading-none">
                        {gameData.totalScore.toLocaleString()}
                    </h1>
                    <div
                        className="inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-widest mt-4"
                        style={{ backgroundColor: rating.color + '20', color: rating.color, border: `1px solid ${rating.color}40` }}
                    >
                        {rating.label}
                    </div>
                </motion.div>

                {/* Summary / Leaderboard */}
                {isMultiplayer && gameData.multiplayerPlayers ? (
                    <div className="w-full flex-1 flex flex-col mb-8 relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] min-h-[400px]">
                        <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                            <h3 className="text-white/80 font-bold uppercase tracking-widest text-sm text-center">LOBİ LİDERLİK TABLOSU</h3>
                        </div>

                        {/* Map showing actual and player guesses for multiplayer */}
                        <div className="flex-grow w-full h-[300px] md:h-full relative pointer-events-auto">
                            <GameMap
                                disabled={true}
                                allRoundsData={gameData.rounds}
                                multiplayerData={gameData.multiplayerPlayers} // We'll update GameMap to handle this combination
                                showResult={true} // trigger multiplayer showing on map
                            />
                        </div>

                        {/* Leaderboard overlayed on map or below it depending on space */}
                        <div className="absolute bottom-0 left-0 right-0 z-[1000] flex flex-wrap justify-center gap-2 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none max-h-[50%] overflow-y-auto custom-scrollbar">
                            {[...gameData.multiplayerPlayers]
                                .sort((a, b) => b.score - a.score)
                                .map((p, idx) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                        className="bg-[#0a0a0a]/80 backdrop-blur-md rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between border border-white/10 relative overflow-hidden pointer-events-auto shadow-lg flex-1 min-w-[200px]"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: p.color }} />
                                        <div className="flex items-center gap-3 pl-3">
                                            <span className="text-lg font-black text-white/50">{idx + 1}.</span>
                                            <span className="text-xl">{p.avatar || '👽'}</span>
                                            <span className="text-sm md:text-md font-bold text-white tracking-widest truncate max-w-[100px] md:max-w-[150px]">{p.name}</span>
                                        </div>
                                        <div className="mt-1 md:mt-0 px-2 flex flex-col items-center">
                                            <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest leading-none mb-1">Puan</span>
                                            <span className="text-lg md:text-xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] leading-none">
                                                {p.score.toLocaleString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex-1 flex flex-col mb-8 min-h-[300px] relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <GameMap
                            disabled={true}
                            allRoundsData={gameData.rounds}
                        />
                        <div className="absolute bottom-4 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
                            <div className="glass px-4 py-2 rounded-full inline-flex gap-4">
                                {gameData.rounds.map((round, idx) => (
                                    <div key={idx} className="flex flex-col items-center pointer-events-auto">
                                        <span className="text-[10px] font-bold text-white/50">R{idx + 1}</span>
                                        <span className="text-xs font-mono font-bold">{round.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button
                        onClick={onPlayAgain}
                        className="btn-primary flex-grow py-5 text-lg"
                    >
                        TEKRAR OYNA
                    </button>
                    <button
                        onClick={onGoHome}
                        className="btn-secondary flex-grow py-5 text-lg"
                    >
                        ANA MENÜ
                    </button>
                </div>

                {/* Bottom stats decorations */}
                <div className="mt-12 w-full flex justify-between px-4 border-t border-white/5 pt-6 opacity-30 font-mono text-[10px] tracking-tighter uppercase whitespace-nowrap gap-4">
                    <span>SEVİYE: PROFESYONEL</span>
                    <span>MOD: {gameData.settings.mode}</span>
                    <span>ZAMAN: {new Date(gameData.date || Date.now()).toLocaleString('tr-TR')}</span>
                </div>
            </motion.div>
        </div>
    );
}
