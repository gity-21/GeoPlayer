<div align="center">
  <img src="assets/icon.png" alt="GeoPlayer Logo" width="128" height="128" />
  <h1>🌍 GeoPlayer</h1>
  <p><strong>A multiplayer geography guessing game built for desktop platforms.</strong></p>
  <p>Explore the world via Google Street View, pinpoint your exact location on a map, and challenge your friends in real-time!</p>
</div>

<br />

![GeoPlayer Screenshot](https://raw.githubusercontent.com/wiki/your-repo/geoplayer-preview.png) *(Preview Placeholder - Add real screenshot here)*

---

## ✨ Features

- **🗺️ Global & Targeted Modes:** Play standard mixed locations worldwide or narrow it down to a single specific country.
- **🎮 Real-Time Multiplayer Server:** Integrated Socket.IO enables up to 8 players to natively join your local/network sessions easily.
- **� Deep Gameplay Mechanics:** Earn points based on accurate distance calculations, tracking speed, and combos!
- **⚡ Battle Royale Mode:** Surviving is key. The player with the lowest score at the end of every round gets eliminated!
- **� Custom Avatars & Chat:** Use built-in emojis for avatars, set personal colors, and type in live chat while playing in a lobby.
- **📱 Fully Responsive UI:** Dark theme, glowing futuristic maps, frameless app windows, smooth animations, and interactive transitions using Framer Motion.
- **🔓 Built-in Bypass Features:** Embeds Google Street View directly without strictly requiring expensive paid Maps APIs, utilizing smart Electron security configurations.

---

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework:** React 18, Vite
- **Styling:** TailwindCSS, Vanilla CSS, Framer Motion
- **Map:** Leaflet, React Leaflet (OpenStreetMap)
- **WebSocket:** Socket.IO Client

### Wrapper & Backend (Desktop/Server)
- **Desktop Environment:** Electron, Electron-Builder
- **Local Server:** Express.js, Node.js, Socket.IO
- **Security Bypass Techniques:** Overriding default Electron `onHeadersReceived` policies to smoothly run frame-based Google View ports.

---

## 🚀 Getting Started

Follow these instructions to start the project on your local machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine (`v18.0.0` or higher is recommended).

### 1. Installation

Clone this repository and open a terminal in the root directory. You must install dependencies in both the root folder **and** the renderer folder.

```bash
# Install dependencies for Electron & Server
npm install

# Install dependencies for the React frontend
cd renderer
npm install
cd ..
```

### 2. Development Mode

The fast workflow automatically runs the Vite dev server and spawns the Electron app concurrently. Hot Reloading is enabled.

```bash
npm run dev
```

---

## 📂 Project Structure

```bash
openmap/
├── main/              # Electron backend process (main.js)
├── preload/           # Electron preload scripts
├── assets/            # App icons, audio assets, and generic files
├── server.js          # The local Express/Socket.IO multiplayer server
├── package.json       # Electron builder config & root scripts
└── renderer/          # The Vite + React Frontend
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── screens/    # Main App Pages (Home, Game, Lobby, Result)
    │   ├── utils/      # Sockets, Storage, Distance Utils
    │   ├── data/       # Coordinate generation datasets
    │   ├── App.jsx     # Main React Tree
    │   └── index.css   # Global Styling
    └── package.json   # Frontend dependency config
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
