import { divIcon } from 'leaflet';

// Modern guess marker (user's guess) - High contrast black dot
export const modernGuessIcon = divIcon({
    className: 'bg-transparent border-none',
    html: `
        <div class="w-4 h-4 rounded-full bg-black border-[3px] border-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
});

// Modern actual marker (correct location) - High contrast white dot with black rim and ping
export const modernActualIcon = divIcon({
    className: 'bg-transparent border-none',
    html: `
        <div class="relative w-6 h-6 flex items-center justify-center">
            <div class="absolute w-full h-full bg-black rounded-full animate-ping opacity-30"></div>
            <div class="w-4 h-4 rounded-full bg-white border-[3px] border-black shadow-[0_0_15px_rgba(0,0,0,0.6)]"></div>
        </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
});
