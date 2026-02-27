import React, { createContext, useState, useContext, useEffect } from 'react';
import storage from '../utils/storage';

// TR → EN country name map
const COUNTRY_MAP = {
    'Dünya Geneli (Karışık)': 'Worldwide (Mixed)',
    'Fransa': 'France',
    'İtalya': 'Italy',
    'İngiltere': 'United Kingdom',
    'Almanya': 'Germany',
    'İspanya': 'Spain',
    'İsveç': 'Sweden',
    'Avusturya': 'Austria',
    'Çekya': 'Czech Republic',
    'Macaristan': 'Hungary',
    'Portekiz': 'Portugal',
    'Danimarka': 'Denmark',
    'Finlandiya': 'Finland',
    'Yunanistan': 'Greece',
    'Türkiye': 'Turkey',
    'Romanya': 'Romania',
    'Hollanda': 'Netherlands',
    'İrlanda': 'Ireland',
    'İsviçre': 'Switzerland',
    'Japonya': 'Japan',
    'Güney Kore': 'South Korea',
    'Çin': 'China',
    'Hong Kong': 'Hong Kong',
    'Singapur': 'Singapore',
    'Tayland': 'Thailand',
    'Hindistan': 'India',
    'BAE': 'UAE',
    'Filipinler': 'Philippines',
    'Vietnam': 'Vietnam',
    'ABD': 'USA',
    'Brezilya': 'Brazil',
    'Arjantin': 'Argentina',
    'Meksika': 'Mexico',
    'Şili': 'Chile',
    'Peru': 'Peru',
    'Kanada': 'Canada',
    'Mısır': 'Egypt',
    'Güney Afrika': 'South Africa',
    'Fas': 'Morocco',
    'Kenya': 'Kenya',
    'Nijerya': 'Nigeria',
    'Avustralya': 'Australia',
    'Yeni Zelanda': 'New Zealand',
    'İsrail': 'Israel',
    'Suudi Arabistan': 'Saudi Arabia',
    'Lübnan': 'Lebanon',
};

const translations = {
    TR: {
        // HomeScreen
        title: "GeoPlayer",
        subtitle: "DÜNYANIN NERESİNDESİN? TAHMİN ET.",
        agentNameLabel: "Ajan Adı",
        agentNamePlaceholder: "Gezgin",
        singlePlayer: "TEK OYUNCULU",
        createLobby: "LOBİ KUR",
        joinLobbyBtn: "KATIL",
        statsBtn: "İSTATİSTİKLER",
        joinLobbyTitle: "LOBİYE KATIL",
        roomIdLabel: "ODA İD",
        roomSettingsTitle: "GÖREV AYARLARI",
        gameModeLabel: "OYUN MODU",
        modeClassic: "KLASİK",
        modeHardcore: "HARDCORE",
        modeBR: "B. ROYALE",
        roundCountLabel: "Raund Sayısı",
        roundCountMax: "(MAX 12)",
        timeLimitLabel: "Zaman Sınırı",
        timeLimitMax: "(SANİYE, MAX 500)",
        locationFilter: "LOKASYON FİLTRESİ",
        worldWide: "Dünya Geneli (Karışık)",
        btnStartLobby: "LOBİ OLUŞTUR",
        btnStartGame: "MACERAYA ATIL",

        // GameScreen
        round: "RAUND",
        timeUp: "SÜRE BİTTİ",
        score: "Puan",
        point: "Puan",
        total: "Toplam",
        distanceLabel: "Mesafe",
        comboLabel: "x KOMBO",
        perfectGuess: "MÜKEMMEL TAHMİN!",
        submitGuess: "TAHMİN ET",
        waitingPlayers: "Diğer oyuncular bekleniyor...",
        exitConfirm: "ÇIKMAK İSTEDİĞİNİZE EMİN MİSİNİZ?",
        yes: "EVET",
        no: "HAYIR",
        loading: "Yükleniyor...",
        guessIndicator: "Tahmininiz",
        actualLocation: "Gerçek Konum",

        // Chat
        chatPrefix: "Sen",
        chatInput: "Mesaj gönder...",
        chatTitle: "SOHBET",

        // LobbyScreen
        lobbyCode: "LOBİ KODU",
        players: "OYUNCULAR",
        waitingForHost: "Kurucu bekleniyor...",
        hostStartBtn: "OYUNU BAŞLAT",
        leaveLobby: "LOBİDEN AYRIL",

        // ResultScreen
        gameResult: "GÖREV SONUCU",
        gameResultMulti: "LOBİ SONUCU",
        totalScore: "TOPLAM PUAN",
        playAgain: "TEKRAR OYNA",
        backToHome: "ANA MENÜ",
        roundResults: "Raund Sonuçları",

        // GameScreen extras
        timeLabel: "SÜRE",
        placeGuess: "Tahmininizi Koyun",
        spectator: "SEYIRCI",
        quitGame: "OYUNDAN ÇIK",
        areYouReady: "HAZIR MISIN?",
        start: "BAŞLA",
        otherAgents: "DİĞER AJANLAR",
        nextRound: "SONRAKİ RAUND",
        seeResults: "SONUÇLARI GÖR",
        guessSubmitted: "TAHMİN GÖNDERİLDİ",

        // LobbyScreen extras
        host: "KURUCU",
        settingsSummary: "Ayarlar",
        shareCode: "Bu kodu arkadaşlarınla paylaş",

        // ResultScreen extras
        lobbyLeaderboard: "LOBİ SIRALAMASI",
        levelPro: "SEVİYE: PROFESYONEL",

        // StatsScreen
        playerProfile: "OYUNCU PROFİLİ",
        loadingStats: "İstatistikler Yükleniyor",
        statsError: "İstatistikler Yüklenemedi",
        statsErrorMsg: "Veriler okunurken bir hata oluştu. Ayarlarınız veya geçmişiniz bozulmuş olabilir.",
        backToMenu: "ANA MENÜYE DÖN",
        unknownDate: "Bilinmeyen Tarih",
        rounds: "RAUND",
        participants: "KATILIMCILAR:",
        eliminated: "💀 ELİMİNE",
        eliminatedSpectator: "ELİMİNE OLDU — SEYIRCI MODU",
        distance: "MESAFE",
        roundScore: "RAUND PUANI",
        pts: "PUAN",
        modeLabel: "MOD:",
        statsTitle: "İSTATİSTİKLER",
        gamesPlayed: "Oynanan Oyun",
        bestScore: "En İyi Skor",
        avgScore: "Ortalama Skor",
        perfectMatches: "Tam İsabet",
        totalDistance: "Toplam Mesafe",
        closeBtn: "KAPAT",
        didYouKnow: "BİLİYOR MUYDUN?"
    },
    EN: {
        // HomeScreen
        title: "GeoPlayer",
        subtitle: "WHERE IN THE WORLD ARE YOU? GUESS.",
        agentNameLabel: "Agent Name",
        agentNamePlaceholder: "Traveler",
        singlePlayer: "SINGLE PLAYER",
        createLobby: "CREATE LOBBY",
        joinLobbyBtn: "JOIN",
        statsBtn: "STATISTICS",
        joinLobbyTitle: "JOIN LOBBY",
        roomIdLabel: "ROOM ID",
        roomSettingsTitle: "MISSION SETTINGS",
        gameModeLabel: "GAME MODE",
        modeClassic: "CLASSIC",
        modeHardcore: "HARDCORE",
        modeBR: "B. ROYALE",
        roundCountLabel: "Rounds",
        roundCountMax: "(MAX 12)",
        timeLimitLabel: "Time Limit",
        timeLimitMax: "(SECONDS, MAX 500)",
        locationFilter: "LOCATION FILTER",
        worldWide: "Worldwide (Mixed)",
        btnStartLobby: "CREATE LOBBY",
        btnStartGame: "START ADVENTURE",

        // GameScreen
        round: "ROUND",
        timeUp: "TIME'S UP",
        score: "Score",
        point: "Points",
        total: "Total",
        distanceLabel: "Distance",
        comboLabel: "x COMBO",
        perfectGuess: "PERFECT GUESS!",
        submitGuess: "GUESS",
        waitingPlayers: "Waiting for other players...",
        exitConfirm: "ARE YOU SURE YOU WANT TO EXIT?",
        yes: "YES",
        no: "NO",
        loading: "Loading...",
        guessIndicator: "Your Guess",
        actualLocation: "Actual Location",

        // Chat
        chatPrefix: "You",
        chatInput: "Send message...",
        chatTitle: "CHAT",

        // LobbyScreen
        lobbyCode: "LOBBY CODE",
        players: "PLAYERS",
        waitingForHost: "Waiting for host...",
        hostStartBtn: "START GAME",
        leaveLobby: "LEAVE LOBBY",

        // ResultScreen
        gameResult: "MISSION RESULT",
        gameResultMulti: "LOBBY RESULT",
        totalScore: "TOTAL SCORE",
        playAgain: "PLAY AGAIN",
        backToHome: "MAIN MENU",
        roundResults: "Round Results",

        // GameScreen extras
        timeLabel: "TIME",
        placeGuess: "Place Your Guess",
        spectator: "SPECTATOR",
        quitGame: "QUIT GAME",
        areYouReady: "ARE YOU READY?",
        start: "START",
        otherAgents: "OTHER AGENTS",
        nextRound: "NEXT ROUND",
        seeResults: "SEE RESULTS",
        guessSubmitted: "GUESS SUBMITTED",

        // LobbyScreen extras
        host: "HOST",
        settingsSummary: "Settings",
        shareCode: "Share this code with friends",

        // ResultScreen extras
        lobbyLeaderboard: "LOBBY LEADERBOARD",
        levelPro: "LEVEL: PROFESSIONAL",

        // StatsScreen
        playerProfile: "PLAYER PROFILE",
        loadingStats: "Loading Stats",
        statsError: "Stats Could Not Be Loaded",
        statsErrorMsg: "An error occurred while reading data. Your settings or history may be corrupted.",
        backToMenu: "BACK TO MAIN MENU",
        unknownDate: "Unknown Date",
        rounds: "ROUNDS",
        participants: "PARTICIPANTS:",
        eliminated: "💀 ELIMINATED",
        eliminatedSpectator: "ELIMINATED — SPECTATOR MODE",
        distance: "DISTANCE",
        roundScore: "ROUND SCORE",
        pts: "PTS",
        modeLabel: "MODE:",
        statsTitle: "STATISTICS",
        gamesPlayed: "Games Played",
        bestScore: "Best Score",
        avgScore: "Avg Score",
        perfectMatches: "Perfect Matches",
        totalDistance: "Total Distance",
        closeBtn: "CLOSE",
        didYouKnow: "DID YOU KNOW?"
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLang] = useState('TR');

    useEffect(() => {
        storage.getProfile().then(profile => {
            if (profile && profile.language) {
                setLang(profile.language);
            }
        });
    }, []);

    const setLanguage = (lang) => {
        setLang(lang);
        storage.updateProfile({ language: lang });
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    // Translate a country name stored in TR to current language
    const translateCountry = (name) => {
        if (!name) return name;
        if (language === 'TR') return name;
        return COUNTRY_MAP[name] || name;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translateCountry }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
