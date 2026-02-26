const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
    closeWindow: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

    // Storage
    getStorage: (key) => ipcRenderer.invoke('storage:get', key),
    setStorage: (key, value) => ipcRenderer.invoke('storage:set', key, value),

    // Audio
    getMusicFiles: () => ipcRenderer.invoke('audio:getMusicFiles'),

    // Platform info
    platform: process.platform,
});
