import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import storage from '../utils/storage';

export default function StatsScreen({ onBack }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('single');

    useEffect(() => {
        let mounted = true;

        // Timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            if (mounted && loading) {
                setError("Yükleme zaman aşımına uğradı. Veri erişiminde bir sorun olabilir.");
                setLoading(false);
            }
        }, 5000);

        const loadStats = async () => {
            try {
                // Robust verification of storage object
                if (!storage || typeof storage.getStats !== 'function') {
                    throw new Error("Depolama sistemi başlatılamadı.");
                }

                const data = await storage.getStats();
                if (mounted) {
                    setStats(data);
                    setLoading(false);
                    clearTimeout(timeout);
                }
            } catch (err) {
                if (mounted) {
                    console.error("Stats load error:", err);
                    setError(err.message || "Bilinmeyen bir veri hatası");
                    setLoading(false);
                    clearTimeout(timeout);
                }
            }
        };

        loadStats();
        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, []);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                    <div className="text-white/70 font-display text-sm tracking-[0.3em] uppercase animate-pulse">Veriler Hazırlanıyor</div>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-black gap-8 p-12 text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 border border-red-500/20">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white font-display">İstatistikler Yüklenemedi</h2>
                    <p className="text-white/40 max-w-sm mx-auto">Veri okunurken bir hata oluştu. Ayarlarınız veya geçmişiniz bozuk olabilir.</p>
                </div>
                <div className="text-white/20 font-mono text-[10px] bg-white/5 p-4 rounded-xl max-w-md overflow-hidden text-ellipsis italic">
                    {error || 'Veri seti boş döndü'}
                </div>
                <button onClick={onBack} className="btn-primary px-12 py-4">ANA MENÜYE DÖN</button>
            </div>
        );
    }

    const formatNum = (num) => (typeof num === 'number' ? num : 0).toLocaleString('tr-TR');

    return (
        <div className="h-full w-full flex flex-col items-center p-4 md:p-6 bg-black overflow-y-auto custom-scrollbar">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl glass rounded-[32px] p-6 md:p-10 flex flex-col relative my-4"
            >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.5em] mb-2">OYUNCU PROFİLİ</span>
                        <h2 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white capitalize leading-none">
                            {stats?.name || 'Gezgin'}
                        </h2>
                    </div>
                    <button
                        onClick={onBack}
                        className="btn-secondary px-6 py-2.5 text-[10px] font-bold tracking-widest flex items-center gap-2 hover:bg-white/10 group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        GERİ DÖN
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
                    <StatCard label="Oynanan Oyun" value={formatNum(stats?.gamesPlayed)} color="neutral" />
                    <StatCard label="Toplam Puan" value={formatNum(stats?.totalScore)} color="neutral" />
                    <StatCard label="En İyi Skor" value={formatNum(stats?.bestScore)} color="neutral" />
                    <StatCard label="Ortalama" value={formatNum(stats?.averageScore)} color="neutral" />
                </div>

                <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-white/5 gap-4">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            Maç Geçmişi
                        </h3>
                        <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setActiveTab('single')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'single' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white/80'}`}
                            >
                                TEK OYUNCULU
                            </button>
                            <button
                                onClick={() => setActiveTab('multi')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'multi' ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(124,92,252,0.4)] scale-105' : 'text-white/40 hover:text-white/80'}`}
                            >
                                ÇOK OYUNCULU
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {(() => {
                            const filteredGames = stats?.recentGames?.filter(g => activeTab === 'multi' ? g.isMultiplayer : !g.isMultiplayer) || [];

                            if (filteredGames.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-16 bg-white/[0.01] rounded-[32px] border border-dashed border-white/5">
                                        <div className="mb-6 opacity-20">
                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                                <line x1="6" y1="20" x2="6" y2="14"></line>
                                                <line x1="2" y1="22" x2="22" y2="22"></line>
                                            </svg>
                                        </div>
                                        <div className="text-white/20 font-bold text-lg mb-1">Henüz Maç Yok</div>
                                        <div className="text-white/10 text-xs text-center">Bu kategoride hiç oyun oynamadın.<br />Maceraya atıl ve sıralamaya gir!</div>
                                    </div>
                                );
                            }

                            return filteredGames.map((game, idx) => (
                                <motion.div
                                    key={game?.id || idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex flex-col p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white/90 text-sm">
                                                    {game?.date ? new Date(game.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Bilinmeyen Tarih'}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] text-white/50 uppercase tracking-[0.2em] font-black">
                                                        {game?.settings?.mode || 'KLASİK'}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                    <span className="text-[9px] text-white/30 font-bold tracking-tight uppercase max-w-[120px] truncate" title={game?.settings?.country || 'GLOBAL'}>
                                                        {game?.settings?.country || 'GLOBAL'}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                    <span className="text-[9px] text-white/30 font-bold tracking-tight uppercase">
                                                        {game?.settings?.roundCount || 5} RAUND
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black font-display text-white transition-colors">
                                                {formatNum(game?.totalScore)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Multiplayer Opponents Display */}
                                    {activeTab === 'multi' && game.multiplayerPlayers && game.multiplayerPlayers.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                                            <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest w-full mb-1">Katılımcılar:</span>
                                            {game.multiplayerPlayers.sort((a, b) => b.score - a.score).map((p, i) => (
                                                <div key={p.id} className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 px-3 py-1.5 rounded-lg">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                    <span className="text-xs font-bold text-white/80">{p.name} <span className="opacity-40 font-mono ml-1">{p.score}</span></span>
                                                    {i === 0 && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded ml-1 font-black">1.</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ));
                        })()}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function StatCard({ label, value, color }) {
    const colorClasses = {
        neutral: 'border-white/20 text-white',
    };

    return (
        <div className={`glass p-5 rounded-[24px] border ${colorClasses[color]} flex flex-col gap-1 transition-all hover:translate-y-[-2px] hover:bg-white/[0.04] group`}>
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1 group-hover:text-white/50 transition-colors">{label}</span>
            <span className="text-2xl md:text-3xl font-black font-display tracking-tighter truncate">{value}</span>
        </div>
    );
}
