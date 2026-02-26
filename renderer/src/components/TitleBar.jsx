import React, { useState, useEffect } from 'react';

const isElectron = typeof window !== 'undefined' && window.electronAPI;

export default function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (!isElectron) return;

        const checkMaximized = async () => {
            const result = await window.electronAPI.isMaximized();
            setIsMaximized(result);
        };

        checkMaximized();
        // We could add an event listener here if we had one in preload
    }, []);

    const handleMinimize = () => {
        window.electronAPI.minimizeWindow();
    };

    const handleMaximize = async () => {
        await window.electronAPI.maximizeWindow();
        const result = await window.electronAPI.isMaximized();
        setIsMaximized(result);
    };

    const handleClose = () => {
        window.electronAPI.closeWindow();
    };

    if (!isElectron) return null;

    return (
        <div
            className="w-full h-9 flex items-center justify-between z-[100] bg-black select-none border-b border-white/5 shrink-0"
            style={{ WebkitAppRegion: 'drag' }}
        >
            <div className="flex items-center gap-3 px-4 pointer-events-none">
                <img src="./icon.png" alt="GeoPlayer Logo" className="w-[14px] h-[14px] opacity-60" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mt-0.5">GeoPlayer</span>
            </div>

            <div className="flex items-center h-full pointer-events-auto" style={{ WebkitAppRegion: 'no-drag' }}>
                <button
                    onClick={handleMinimize}
                    className="w-12 h-full flex items-center justify-center hover:bg-white/5 transition-colors group"
                >
                    <div className="w-3 h-[1.5px] bg-white/40 group-hover:bg-white" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="w-12 h-full flex items-center justify-center hover:bg-white/5 transition-colors group"
                >
                    <div className="w-3 h-3 border border-white/40 group-hover:border-white rounded-[2px]" />
                </button>
                <button
                    onClick={handleClose}
                    className="w-12 h-full flex items-center justify-center hover:bg-red-500 transition-colors group"
                >
                    <svg className="w-3 h-3 text-white/40 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
}
