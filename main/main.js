const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

if (isDev) {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
}

// Start the local multiplayer server in the background
try {
    // In production, server.js is extracted outside the asar archive (asarUnpack)
    // so its require() calls for express/socket.io can resolve node_modules correctly.
    const serverPath = app.isPackaged
        ? path.join(process.resourcesPath, 'app.asar.unpacked', 'server.js')
        : path.join(__dirname, '..', 'server.js');
    require(serverPath);
} catch (error) {
    console.error("Failed to start integrated multiplayer server:", error);
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1100,
        minHeight: 750,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#0a0a1a',
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webSecurity: true,
            // Enable sensor features for Google Street View
            enableBlinkFeatures: 'SensorExtraClasses',
        },
        icon: path.join(__dirname, '..', 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
        show: false,
    });

    // Graceful show
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'dist', 'index.html'));
    }

    // Security: prevent new windows (but allow Google Maps popups to be denied)
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
}

// IPC Handlers for window controls
ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.handle('window:close', () => {
    mainWindow?.close();
});

ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false;
});

// Game data IPC handlers
ipcMain.handle('storage:get', (event, key) => {
    const fs = require('fs');
    const storageDir = path.join(app.getPath('userData'), 'gamedata');
    const filePath = path.join(storageDir, `${key}.json`);

    try {
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (err) {
        console.error('Storage read error:', err);
        return null;
    }
});

ipcMain.handle('storage:set', (event, key, value) => {
    const fs = require('fs');
    const storageDir = path.join(app.getPath('userData'), 'gamedata');
    const filePath = path.join(storageDir, `${key}.json`);

    try {
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
        return true;
    } catch (err) {
        console.error('Storage write error:', err);
        return false;
    }
});

// Audio files IPC handler
ipcMain.handle('audio:getMusicFiles', () => {
    const fs = require('fs');
    // Read music files from Vite's public/assets (dev) or dist/assets (prod)
    const assetsDir = isDev
        ? path.join(__dirname, '..', 'renderer', 'public', 'assets')
        : path.join(__dirname, '..', 'renderer', 'dist', 'assets');

    try {
        if (fs.existsSync(assetsDir)) {
            const files = fs.readdirSync(assetsDir);
            // Only include mp3, ogg, or wav files
            const musicFiles = files.filter(file => file.match(/\.(mp3|wav|ogg)$/i));
            return musicFiles;
        }
        return [];
    } catch (err) {
        console.error('Error reading assets directory:', err);
        return [];
    }
});

// ============================================
// CRITICAL: Remove X-Frame-Options from Google Maps responses
// This allows us to embed Google Street View in iframes
// without needing an API key. Electron-specific feature.
// ============================================
app.on('ready', () => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = { ...details.responseHeaders };

        // Remove X-Frame-Options and frame-ancestors from Google domains
        // This enables free Google Street View embedding
        const url = details.url || '';
        const isGoogleDomain = url.includes('google.com') || url.includes('googleapis.com') || url.includes('gstatic.com') || url.includes('ggpht.com');

        if (isGoogleDomain) {
            // Remove headers that block iframe embedding
            delete responseHeaders['X-Frame-Options'];
            delete responseHeaders['x-frame-options'];
            delete responseHeaders['Content-Security-Policy'];
            delete responseHeaders['content-security-policy'];
        }

        // Set our app's CSP (only for our own pages, not Google's)
        if (!isGoogleDomain) {
            responseHeaders['Content-Security-Policy'] = [
                isDev
                    ? "default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:* ws://localhost:*; script-src * 'self' 'unsafe-inline' 'unsafe-eval'; img-src * 'self' data: blob:; connect-src * 'self' http://localhost:* ws://localhost:*; font-src * 'self' data:; style-src * 'self' 'unsafe-inline'; frame-src *;"
                    : "default-src * 'self' 'unsafe-inline' data: blob:; script-src * 'self' 'unsafe-inline'; img-src * 'self' data: blob:; connect-src * 'self'; font-src * 'self' data:; style-src * 'self' 'unsafe-inline'; frame-src *;"
            ];
            // Allow sensor features for Street View
            responseHeaders['Permissions-Policy'] = [
                'accelerometer=(*), gyroscope=(*), magnetometer=(*)'
            ];
        }

        callback({ responseHeaders });
    });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
