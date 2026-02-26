import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SERVER_URL || 'https://geoplayer-i3em.onrender.com';
export const socket = io(URL, {
    autoConnect: false // We will connect manually when entering multiplayer
});
