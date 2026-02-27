import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import storage from '../utils/storage';
import { useLanguage } from '../contexts/LanguageContext';
import RotatingGlobe from '../components/RotatingGlobe';
import { getAllCountries } from '../data/locations';

export default function HomeScreen({ onStartGame, onShowStats, onHostLobby, onJoinLobby }) {
    const [settings, setSettings] = useState({
        mode: 'classic',
        timerDuration: 60,
        roundCount: 5,
        country: 'Dünya Geneli (Karışık)',
    });
    const [step, setStep] = useState('main'); // 'main', 'settings', 'join'
    const [joinRoomId, setJoinRoomId] = useState('');
    const [isMultiplayer, setIsMultiplayer] = useState(false);
    const [playerName, setPlayerName] = useState('Traveler');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { language, setLanguage, t, translateCountry } = useLanguage();

    useEffect(() => {
        storage.getProfile().then(profile => {
            if (profile && profile.name) {
                setPlayerName(profile.name);
            }
        });
    }, []);

    const handleToSettings = (multiplayer) => {
        storage.updateProfile({ name: playerName });
        setIsMultiplayer(multiplayer);
        if (!multiplayer && settings.mode === 'battleroyale') {
            setSettings({ ...settings, mode: 'classic' });
        }
        setStep('settings');
    }

    const handleToJoin = () => {
        storage.updateProfile({ name: playerName });
        setStep('join');
    }

    const handleStartGame = () => {
        const finalSettings = { ...settings };
        if (!finalSettings.roundCount || finalSettings.roundCount < 1) finalSettings.roundCount = 1;
        if (!finalSettings.timerDuration || finalSettings.timerDuration < 5) finalSettings.timerDuration = 5;

        if (isMultiplayer) {
            onHostLobby({ ...finalSettings, playerName });
        } else {
            onStartGame({ ...finalSettings, playerName });
        }
    };

    const handleJoinRoom = () => {
        if (!joinRoomId.trim()) return;
        onJoinLobby({ roomId: joinRoomId, playerName });
    };

    return (
        <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 relative overflow-hidden z-0">
            {/* Background Globe & Decoration */}
            <div className="absolute inset-0 flex items-center justify-center -z-20 pointer-events-none opacity-40">
                <div className="w-[180vw] h-[180vw] md:w-[130vw] md:h-[130vw] lg:w-[100vw] lg:h-[100vw] max-w-[1200px] max-h-[1200px] flex items-center justify-center mix-blend-screen transition-all duration-1000">
                    <RotatingGlobe />
                </div>
            </div>
            <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <AnimatePresence>
                {step === 'main' && (
                    <motion.button
                        key="lang-toggle"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => setLanguage(language === 'TR' ? 'EN' : 'TR')}
                        className="absolute top-6 right-6 md:top-8 md:right-8 z-50 pointer-events-auto w-12 h-12 flex items-center justify-center glass rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 transition-all text-sm font-black tracking-widest text-white/80 hover:text-white"
                    >
                        {language}
                    </motion.button>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {step === 'main' && (
                    <motion.div
                        key="hero"
                        initial={{ opacity: 0, scale: 0.9, y: 30, height: 'auto' }}
                        animate={{ opacity: 1, scale: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, scale: 0.8, y: -30, height: 0, overflow: 'hidden', padding: 0, margin: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="text-center mb-10"
                    >
                        <div className="mb-4 mt-6 md:mt-0" />
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tighter mb-2 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            {t('title')}
                        </h1>
                        <p className="text-xs md:text-sm font-mono text-white/40 tracking-[0.4em] uppercase">
                            {t('subtitle')}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-full max-w-md glass p-6 md:p-8 rounded-[32px] border-white/10 z-10 mx-auto"
            >
                <div className="space-y-8 mt-4">
                    <AnimatePresence mode="wait">
                        {step === 'main' ? (
                            <motion.div
                                key="main"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* Player Name Input */}
                                <div className="relative group">
                                    <label className="absolute -top-2 left-6 bg-[#0a0a0a] px-2 text-[10px] font-bold text-white/40 uppercase tracking-widest z-10 transition-colors group-hover:text-white/70">
                                        {t('agentNameLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        placeholder={t('agentNamePlaceholder')}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-center text-2xl text-white font-black font-display tracking-[0.2em] focus:border-white/40 focus:bg-white/[0.04] outline-none transition-all placeholder:text-white/5"
                                    />
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => handleToSettings(false)}
                                            className="w-full py-4 md:py-5 rounded-full bg-white text-black font-black text-xs md:text-sm tracking-[0.2em] uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                                        >
                                            {t('singlePlayer')}
                                        </button>
                                        <button
                                            onClick={() => handleToSettings(true)}
                                            className="w-full py-4 md:py-5 rounded-full bg-brand-primary text-white font-black text-xs md:text-sm tracking-[0.2em] uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(124,92,252,0.3)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
                                        >
                                            {t('createLobby')}
                                        </button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={handleToJoin}
                                            className="w-full py-3 md:py-4 rounded-full bg-transparent border border-white/20 text-white font-bold text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/40 active:scale-95 transition-all"
                                        >
                                            {t('joinLobbyBtn')}
                                        </button>
                                        <button
                                            onClick={onShowStats}
                                            className="w-full py-3 md:py-4 rounded-full bg-transparent border border-white/10 text-white/60 font-bold text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-white/5 hover:text-white active:scale-95 transition-all"
                                        >
                                            {t('statsBtn')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                        ) : step === 'join' ? (
                            <motion.div
                                key="join"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8 relative"
                            >
                                <button
                                    onClick={() => setStep('main')}
                                    className="absolute -top-6 -left-2 text-white/40 hover:text-white transition-colors"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>
                                <div className="text-center mb-6 pt-4">
                                    <h3 className="text-xl font-bold tracking-[0.2em] text-white">{t('joinLobbyTitle')}</h3>
                                </div>
                                <div className="relative group">
                                    <label className="absolute -top-2 left-6 bg-[#0a0a0a] px-2 text-[10px] font-bold text-white/40 uppercase tracking-widest z-10 transition-colors group-hover:text-white/70">
                                        {t('roomIdLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={joinRoomId}
                                        onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                                        placeholder="ABCD"
                                        maxLength={4}
                                        className="w-full bg-white/[0.02] border border-brand-primary/50 shadow-[0_0_15px_rgba(124,92,252,0.2)] rounded-2xl px-6 py-5 text-center text-3xl text-white font-black font-mono tracking-[0.4em] focus:border-brand-primary focus:shadow-[0_0_25px_rgba(124,92,252,0.4)] focus:bg-white/[0.04] outline-none transition-all placeholder:text-white/10"
                                    />
                                </div>
                                <div className="pt-4 flex flex-col gap-3">
                                    <button
                                        onClick={handleJoinRoom}
                                        className="w-full py-5 rounded-full bg-brand-primary text-white font-black text-xl tracking-[0.3em] uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(124,92,252,0.3)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
                                    >
                                        {t('joinLobbyBtn')}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8 relative"
                            >
                                <button
                                    onClick={() => setStep('main')}
                                    className="absolute -top-6 -left-2 text-white/40 hover:text-white transition-colors"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>

                                <div className="text-center mb-6 pt-4">
                                    <h3 className="text-xl font-bold tracking-[0.2em] text-white">{t('roomSettingsTitle')}</h3>
                                </div>

                                {/* Game Mode Selection */}
                                <div className="text-center mt-2 relative z-[60]">
                                    <label className="block text-center text-[10px] font-bold text-white/40 mb-3 uppercase tracking-[0.3em]">
                                        {t('gameModeLabel')}
                                    </label>
                                    <div className="flex bg-white/5 p-1 rounded-2xl w-full">
                                        <button
                                            onClick={() => setSettings({ ...settings, mode: 'classic' })}
                                            className={`flex-1 px-2 sm:px-4 py-3 rounded-xl text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all ${settings.mode === 'classic' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white/80'}`}
                                        >
                                            {t('modeClassic')}
                                        </button>
                                        <button
                                            onClick={() => setSettings({ ...settings, mode: 'hardcore' })}
                                            className={`flex-1 px-2 sm:px-4 py-3 rounded-xl text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all ${settings.mode === 'hardcore' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-105' : 'text-white/40 hover:text-white/80'}`}
                                        >
                                            {t('modeHardcore')}
                                        </button>
                                        {isMultiplayer && (
                                            <button
                                                onClick={() => setSettings({ ...settings, mode: 'battleroyale' })}
                                                className={`flex-1 px-2 sm:px-4 py-3 rounded-xl text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all ${settings.mode === 'battleroyale' ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(124,92,252,0.4)] scale-105' : 'text-white/40 hover:text-white/80'}`}
                                            >
                                                {t('modeBR')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Round Count */}
                                <div className="relative group mt-4">
                                    <label className="absolute -top-2 left-6 bg-[#0a0a0a] px-2 text-[10px] font-bold text-white/40 uppercase tracking-widest z-10 transition-colors group-hover:text-white/70">
                                        {t('roundCountLabel')} <span className="text-[8px] opacity-50">{t('roundCountMax')}</span>
                                    </label>
                                    <div className="flex items-center w-full bg-white/[0.02] border border-white/10 rounded-2xl focus-within:border-white/40 focus-within:bg-white/[0.04] transition-all overflow-hidden">
                                        <button
                                            onClick={() => setSettings({ ...settings, roundCount: Math.max(1, (settings.roundCount || 1) - 1) })}
                                            className="w-16 h-[72px] flex flex-col items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors font-mono text-3xl font-light pb-1"
                                        >
                                            &minus;
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={settings.roundCount}
                                            onChange={(e) => {
                                                let val = parseInt(e.target.value);
                                                if (isNaN(val)) val = "";
                                                else if (val > 12) val = 12;
                                                setSettings({ ...settings, roundCount: val });
                                            }}
                                            onBlur={(e) => {
                                                if (!settings.roundCount || settings.roundCount < 1) {
                                                    setSettings({ ...settings, roundCount: 1 });
                                                }
                                            }}
                                            className="flex-1 bg-transparent px-4 py-5 text-center text-2xl text-white font-black font-display tracking-[0.2em] outline-none placeholder:text-white/5"
                                        />
                                        <button
                                            onClick={() => setSettings({ ...settings, roundCount: Math.min(12, (settings.roundCount || 1) + 1) })}
                                            className="w-16 h-[72px] flex flex-col items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors font-mono text-3xl font-light pb-1"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Timer Duration */}
                                <div className="relative group">
                                    <label className="absolute -top-2 left-6 bg-[#0a0a0a] px-2 text-[10px] font-bold text-white/40 uppercase tracking-widest z-10 transition-colors group-hover:text-white/70">
                                        {t('timeLimitLabel')} <span className="text-[8px] opacity-50">{t('timeLimitMax')}</span>
                                    </label>
                                    <div className="flex items-center w-full bg-white/[0.02] border border-white/10 rounded-2xl focus-within:border-white/40 focus-within:bg-white/[0.04] transition-all overflow-hidden">
                                        <button
                                            onClick={() => setSettings({ ...settings, timerDuration: Math.max(5, (settings.timerDuration || 60) - 5) })}
                                            className="w-16 h-[72px] flex flex-col items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors font-mono text-3xl font-light pb-1"
                                        >
                                            &minus;
                                        </button>
                                        <input
                                            type="number"
                                            min="5"
                                            max="500"
                                            value={settings.timerDuration}
                                            onChange={(e) => {
                                                let val = parseInt(e.target.value);
                                                if (isNaN(val)) val = "";
                                                else if (val > 500) val = 500;
                                                setSettings({ ...settings, timerDuration: val });
                                            }}
                                            onBlur={(e) => {
                                                if (!settings.timerDuration || settings.timerDuration < 5) {
                                                    setSettings({ ...settings, timerDuration: 5 });
                                                }
                                            }}
                                            className="flex-1 bg-transparent px-4 py-5 text-center text-2xl text-white font-black font-display tracking-[0.2em] outline-none placeholder:text-white/5"
                                        />
                                        <button
                                            onClick={() => setSettings({ ...settings, timerDuration: Math.min(500, (settings.timerDuration || 60) + 5) })}
                                            className="w-16 h-[72px] flex flex-col items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors font-mono text-3xl font-light pb-1"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Country Filter */}
                                <div className="relative z-50">
                                    <label className="block text-center text-[10px] font-bold text-white/40 mb-3 uppercase tracking-[0.3em]">
                                        {t('locationFilter')}
                                    </label>
                                    <div className="relative">
                                        <div
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className={`w-full bg-[#0a0a0a] border ${isDropdownOpen ? 'border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'border-white/10'} rounded-2xl px-6 py-4 flex items-center justify-center cursor-pointer transition-all hover:border-white/30 group`}
                                        >
                                            <span className="text-lg text-white font-bold tracking-[0.1em] text-center">
                                                {translateCountry(settings.country)}
                                            </span>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                <svg className={`w-5 h-5 text-white/50 transition-transform duration-300 group-hover:text-white ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                                    exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute top-full left-0 right-0 mt-3 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-[100] max-h-56 overflow-y-auto origin-top webkit-scrollbar"
                                                >
                                                    {['Dünya Geneli (Karışık)', ...getAllCountries()].map(country => (
                                                        <div
                                                            key={country}
                                                            onClick={() => {
                                                                setSettings({ ...settings, country });
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`px-6 py-4 text-center text-sm font-bold tracking-widest cursor-pointer transition-colors border-b border-white/[0.02] last:border-0 ${settings.country === country ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                                        >
                                                            {translateCountry(country)}
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="pt-6 flex flex-col gap-3">
                                    <button
                                        onClick={handleStartGame}
                                        className={`w-full py-5 rounded-full text-black font-black text-xl tracking-[0.3em] uppercase hover:scale-105 active:scale-95 transition-all ${isMultiplayer ? 'bg-brand-primary text-white shadow-[0_0_30px_rgba(124,92,252,0.3)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]' : 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]'}`}
                                    >
                                        {isMultiplayer ? t('btnStartLobby') : t('btnStartGame')}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <div className="absolute bottom-8 text-white/20 text-xs font-mono tracking-tighter">
                GEOPLAYER PRO v2.5
            </div>
        </div >
    );
}
