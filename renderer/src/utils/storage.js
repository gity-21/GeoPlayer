// Storage helper that works both in Electron and browser
const isElectron = typeof window !== 'undefined' && window.electronAPI;

const storage = {
    async get(key) {
        if (isElectron) {
            return await window.electronAPI.getStorage(key);
        }
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    async set(key, value) {
        if (isElectron) {
            return await window.electronAPI.setStorage(key, value);
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    // High scores
    async getHighScores() {
        const scores = await this.get('highScores');
        return scores || [];
    },

    async addHighScore(score) {
        const scores = await this.getHighScores();
        scores.push({
            ...score,
            id: Date.now(),
            date: new Date().toISOString(),
        });
        // Keep top 50 scores
        scores.sort((a, b) => b.totalScore - a.totalScore);
        const trimmed = scores.slice(0, 50);
        await this.set('highScores', trimmed);
        return trimmed;
    },

    // Game history
    async getGameHistory() {
        const history = await this.get('gameHistory');
        return history || [];
    },

    async addGameToHistory(game) {
        const history = await this.getGameHistory();
        history.unshift({
            ...game,
            id: Date.now(),
            date: new Date().toISOString(),
        });
        // Keep last 100 games
        const trimmed = history.slice(0, 100);
        await this.set('gameHistory', trimmed);
        return trimmed;
    },

    // Player profile
    async getProfile() {
        const defaults = {
            name: 'Gezgin',
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            achievements: [],
            createdAt: new Date().toISOString(),
        };
        const profile = await this.get('playerProfile');
        return profile ? { ...defaults, ...profile } : defaults;
    },

    async updateProfile(updates) {
        const profile = await this.getProfile();
        const updated = { ...profile, ...updates };
        await this.set('playerProfile', updated);
        return updated;
    },

    // Settings
    async getSettings() {
        const settings = await this.get('settings');
        return settings || {
            timerDuration: 60,
            roundCount: 5,
            soundEnabled: true,
            darkMode: true,
            mapStyle: 'default',
        };
    },

    async updateSettings(updates) {
        const settings = await this.getSettings();
        const updated = { ...settings, ...updates };
        await this.set('settings', updated);
        return updated;
    },

    // Daily challenge
    async getDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];
        const challenge = await this.get('dailyChallenge');
        if (challenge && challenge.date === today) {
            return challenge;
        }
        return null;
    },

    async setDailyChallenge(challenge) {
        const today = new Date().toISOString().split('T')[0];
        await this.set('dailyChallenge', { ...challenge, date: today });
    },

    // Statistics
    async getStats() {
        try {
            const profile = await storage.getProfile();
            const history = await storage.getGameHistory();
            const scores = await storage.getHighScores();

            return {
                name: profile?.name || 'Gezgin',
                gamesPlayed: profile?.gamesPlayed || 0,
                totalScore: profile?.totalScore || 0,
                bestScore: profile?.bestScore || 0,
                averageScore: (profile?.gamesPlayed > 0) ? Math.round(profile.totalScore / profile.gamesPlayed) : 0,
                recentGames: Array.isArray(history) ? history.slice(0, 10) : [],
                topScores: Array.isArray(scores) ? scores.slice(0, 10) : [],
            };
        } catch (err) {
            console.error("Critical error in getStats:", err);
            // Return minimal valid object to prevent UI crash
            return {
                name: 'Gezgin',
                gamesPlayed: 0,
                totalScore: 0,
                bestScore: 0,
                averageScore: 0,
                recentGames: [],
                topScores: [],
            };
        }
    },
};

// Replace 'this' with 'storage' for all internal calls to avoid context issues
storage.getHighScores = storage.getHighScores.bind(storage);
storage.addHighScore = storage.addHighScore.bind(storage);
storage.getGameHistory = storage.getGameHistory.bind(storage);
storage.addGameToHistory = storage.addGameToHistory.bind(storage);
storage.getProfile = storage.getProfile.bind(storage);
storage.updateProfile = storage.updateProfile.bind(storage);
storage.getStats = storage.getStats.bind(storage);

export default storage;
