import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Free Google Street View — NO API KEY
// Uses iframe embed with CSS overlays to hide Google UI elements

const StreetViewPanel = React.memo(function StreetViewPanel({ location, roundNumber, showResult, result, mode }) {
    const [loading, setLoading] = useState(true);
    const iframeRef = useRef(null);
    const timerRef = useRef(null);

    const streetViewUrl = useMemo(() => {
        if (!location) return '';
        const heading = Math.floor(Math.random() * 360);
        return `https://maps.google.com/maps?layer=c&cbll=${location.lat},${location.lng}&cbp=12,${heading},0,0,0&output=svembed`;
    }, [location?.lat, location?.lng]);

    useEffect(() => {
        setLoading(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setLoading(false), 4000);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [streetViewUrl]);

    function handleIframeLoad() {
        if (timerRef.current) clearTimeout(timerRef.current);
        setLoading(false);
    }

    return (
        <div className="w-full h-full relative" style={{ background: 'var(--bg-base)' }}>
            {/* Street View iframe */}
            {streetViewUrl && (
                <iframe
                    ref={iframeRef}
                    key={streetViewUrl}
                    src={streetViewUrl}
                    className="w-full h-full"
                    style={{
                        border: 'none',
                        filter: showResult ? 'brightness(0.35) blur(2px) saturate(0.5)' : 'none',
                        transition: 'filter 0.8s ease',
                        pointerEvents: (mode === 'hardcore' || showResult) ? 'none' : 'auto'
                    }}
                    onLoad={handleIframeLoad}
                    allow="accelerometer *; gyroscope *; magnetometer *; autoplay; clipboard-write; encrypted-media"
                    referrerPolicy="no-referrer"
                    title="Google Street View"
                />
            )}

            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.6 } }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-20"
                        style={{ background: 'var(--bg-base)' }}
                    >
                        <div style={{ position: 'relative', marginBottom: '24px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                border: '2px solid rgba(124, 92, 252, 0.15)',
                                borderTopColor: 'var(--brand-primary)',
                                animation: 'spin 0.9s linear infinite',
                            }} />
                            <motion.div style={{
                                position: 'absolute',
                                inset: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                    <path d="M2 12h20"></path>
                                </svg>
                            </motion.div>
                        </div>
                        <p className="font-display text-sm tracking-widest uppercase text-white/40 animate-pulse">Lokasyon Hazırlanıyor</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* UI Blockers - Only address blocker kept to hide location clues */}
            {!loading && (
                <>
                    <div className="street-view-address-blocker" />
                </>
            )}

            {/* Hardcore Mode Overlay Badge */}
            {mode === 'hardcore' && !showResult && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 px-6 py-2 rounded-full backdrop-blur-md flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.3)] z-10 pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="3" y1="3" x2="21" y2="21"></line>
                    </svg>
                    <span className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase">Hardcore (Kör) Modu</span>
                </div>
            )}

        </div>
    );
});

export default StreetViewPanel;
