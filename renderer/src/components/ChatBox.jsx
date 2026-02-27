import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../utils/socketClient';
import { useLanguage } from '../contexts/LanguageContext';

const ChatBox = React.memo(function ChatBox({ roomId, playerName, playerColor, isGameScreen = false }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(!isGameScreen);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const { t } = useLanguage();

    useEffect(() => {
        const handleNewChat = (data) => {
            setMessages((prev) => [...prev, data]);
            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        };

        socket.on('new_chat', handleNewChat);
        return () => {
            socket.off('new_chat', handleNewChat);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        socket.emit('send_chat', {
            roomId,
            message: inputValue.trim(),
            senderName: playerName,
            senderColor: playerColor
        });
        setInputValue('');
    };

    if (!isOpen) {
        return (
            <div className={`fixed ${isGameScreen ? 'bottom-28 right-6' : 'bottom-6 right-6'} z-[70]`}>
                <button
                    onClick={() => { setIsOpen(true); setUnreadCount(0); }}
                    className="relative bg-[#0a0a0a] border border-white/10 w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/5 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-[0_0_10px_rgba(124,92,252,0.8)]">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`fixed ${isGameScreen ? 'bottom-[120px] right-6' : 'bottom-24 right-5 sm:right-6'} shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col z-[80] pointer-events-auto w-[calc(100%-40px)] max-w-[340px]`}
            style={{ height: '400px', maxHeight: '60vh' }}
        >
            <div className="flex flex-col h-full bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center shrink-0 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">{t('chatTitle')}</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                            const isMe = msg.senderId === socket.id;
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                >
                                    <span className="text-[9px] font-bold mb-1 opacity-40 uppercase flex items-center gap-1" style={{ color: !isMe ? msg.senderColor : undefined }}>
                                        {isMe ? t('chatPrefix') : msg.senderName}
                                    </span>
                                    <div
                                        className={`px-3 py-2 text-sm rounded-xl max-w-[85%] break-words leading-snug ${isMe ? 'bg-brand-primary/10 text-white rounded-tr-none border border-brand-primary/20' : 'bg-white/5 text-white/90 rounded-tl-none border border-white/5'}`}
                                    >
                                        {msg.message}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-white/10 shrink-0 bg-black/40">
                    <form onSubmit={handleSendMessage} className="relative flex items-center">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={t('chatInput')}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-white/30 transition-all font-display text-white placeholder:text-white/20"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="absolute right-2 w-8 h-8 flex items-center justify-center bg-brand-primary rounded-full text-white disabled:opacity-30 disabled:bg-white/10 transition-all"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(-1px)' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
});

export default ChatBox;
