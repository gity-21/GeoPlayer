import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../utils/socketClient';

const EmojiReactions = React.memo(function EmojiReactions({ roomId, isMultiplayer }) {
    const [reactions, setReactions] = useState([]);

    useEffect(() => {
        if (!isMultiplayer) return;

        const handleNewReaction = (data) => {
            // data.emoji
            const newReaction = {
                id: data.id,
                emoji: data.emoji,
                xOffset: Math.random() * 80 + 10, // 10% to 90% across screen
            };

            setReactions(prev => [...prev, newReaction]);

            // Remove after animation
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== data.id));
            }, 3000);
        };

        socket.on('new_reaction', handleNewReaction);
        return () => {
            socket.off('new_reaction', handleNewReaction);
        };
    }, [isMultiplayer]);

    if (!isMultiplayer) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
            <AnimatePresence>
                {reactions.map((r) => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0, scale: 0.5, y: '100vh', x: `${r.xOffset}vw` }}
                        animate={{ opacity: 1, scale: 2, y: '-20vh', x: `${r.xOffset + (Math.random() * 10 - 5)}vw` }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 2.5, ease: "easeOut" }}
                        className="absolute text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    >
                        {r.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
});

export default EmojiReactions;
