import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { modernGuessIcon, modernActualIcon } from './ModernMarker';
import { useLanguage } from '../contexts/LanguageContext';

// Click handler component
function MapClickHandler({ onMapClick, disabled }) {
    useMapEvents({
        click: (e) => {
            if (!disabled) {
                onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        },
    });
    return null;
}

// Auto fit bounds component
function FitBounds({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, duration: 1.5 });
        }

        // Force invalidate size after render to fix grey areas/rendering issues
        setTimeout(() => map.invalidateSize(), 50);
    }, [bounds, map]);
    return null;
}

// Auto resize component to fix grey map areas during CSS transitions
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        // Observe the map's container for any size changes
        resizeObserver.observe(map.getContainer());

        return () => resizeObserver.disconnect();
    }, [map]);
    return null;
}

const GameMap = React.memo(function GameMap({
    onMapClick,
    guessPosition,
    actualPosition,
    showResult,
    disabled,
    isExpanded,
    roundLocations,
    multiplayerData,
    allRoundsData, // Added for summary map
}) {
    const { language, translateCountry } = useLanguage();

    const bounds = useMemo(() => {
        if (allRoundsData && allRoundsData.length > 0) {
            const lats = [];
            const lngs = [];
            allRoundsData.forEach((r, idx) => {
                if (r.actual) {
                    lats.push(r.actual.lat);
                    lngs.push(r.actual.lng);
                }
                if (r.guess) {
                    lats.push(r.guess.lat);
                    lngs.push(r.guess.lng);
                }

                // If it's a multiplayer summary map
                if (multiplayerData && multiplayerData.length > 0) {
                    multiplayerData.forEach(p => {
                        // if we stored round by round guesses for players, we'd add them here
                        // but since we only have `p.guess` as their last round guess, or we need to extract from gameData
                        // For safety, let's just make sure the map encompasses everything 
                    });
                }
            });
            // Try to add bounds from the final multiplayer players array (which holds history or latest)
            if (multiplayerData && multiplayerData.length > 0) {
                multiplayerData.forEach(p => {
                    if (p.guess) {
                        lats.push(p.guess.lat);
                        lngs.push(p.guess.lng);
                    }
                });
            }

            if (lats.length > 0 && lngs.length > 0) {
                return L.latLngBounds(
                    L.latLng(Math.min(...lats), Math.min(...lngs)),
                    L.latLng(Math.max(...lats), Math.max(...lngs))
                ).pad(0.1);
            }
        }

        if (showResult && multiplayerData && actualPosition) {
            // Find bounds for all guesses + actual
            const lats = [actualPosition.lat];
            const lngs = [actualPosition.lng];
            multiplayerData.forEach(p => {
                if (p.guess) {
                    lats.push(p.guess.lat);
                    lngs.push(p.guess.lng);
                }
            });
            return L.latLngBounds(
                L.latLng(Math.min(...lats), Math.min(...lngs)),
                L.latLng(Math.max(...lats), Math.max(...lngs))
            ).pad(0.1);
        }

        if (showResult && guessPosition && actualPosition) {
            return L.latLngBounds(
                L.latLng(guessPosition.lat, guessPosition.lng),
                L.latLng(actualPosition.lat, actualPosition.lng)
            ).pad(0.1);
        }

        return null;
    }, [showResult, guessPosition, actualPosition, multiplayerData, allRoundsData]);

    const mapMaxBounds = useMemo(() => {
        return L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));
    }, []);

    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxBounds={mapMaxBounds}
            maxBoundsViscosity={1.0}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            zoomControl={false}
            attributionControl={false}
            className="rounded-xl w-full h-full bg-[#f4f4f4]"
        >
            <MapResizer />
            <TileLayer
                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                maxZoom={18}
                noWrap={true}
                bounds={mapMaxBounds}
                attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            <MapClickHandler onMapClick={onMapClick} disabled={disabled} />

            {bounds && <FitBounds bounds={bounds} />}

            {guessPosition && !multiplayerData && (
                <Marker position={[guessPosition.lat, guessPosition.lng]} icon={modernGuessIcon}>
                    <Popup className="custom-popup">
                        <span className="font-semibold text-neutral-800">
                            Your Guess
                        </span>
                    </Popup>
                </Marker>
            )}

            {showResult && actualPosition && (
                <>
                    <Marker position={[actualPosition.lat, actualPosition.lng]} icon={modernActualIcon}>
                        <Popup className="custom-popup">
                            <span className="font-semibold text-neutral-800">
                                {actualPosition.city}, {actualPosition.country}
                            </span>
                        </Popup>
                    </Marker>

                    {(guessPosition && !multiplayerData) && (
                        <Polyline
                            positions={[
                                [guessPosition.lat, guessPosition.lng],
                                [actualPosition.lat, actualPosition.lng],
                            ]}
                            color="#000000"
                            weight={4}
                            opacity={0.7}
                            dashArray="8, 8"
                            className="distance-line"
                        />
                    )}

                    {multiplayerData && multiplayerData.map(p => {
                        if (!p.guess) return null;

                        // Custom colored marker with Avatar
                        const pIcon = L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div style="background-color: ${p.color}aa; backdrop-filter: blur(4px); width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${p.color}; box-shadow: 0 0 15px ${p.color}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: white;">${p.name ? p.name[0].toUpperCase() : '?'}</div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        });

                        return (
                            <React.Fragment key={p.id}>
                                <Marker position={[p.guess.lat, p.guess.lng]} icon={pIcon}>
                                    <Popup className="custom-popup">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold border-b pb-1 mb-1" style={{ color: p.color }}>{p.name}</span>
                                            <span className="font-mono text-xs text-neutral-600">
                                                {p.lastScore} pts
                                            </span>
                                        </div>
                                    </Popup>
                                </Marker>
                                <Polyline
                                    positions={[
                                        [p.guess.lat, p.guess.lng],
                                        [actualPosition.lat, actualPosition.lng],
                                    ]}
                                    color={p.color}
                                    weight={3}
                                    opacity={0.7}
                                    dashArray="6, 6"
                                />
                            </React.Fragment>
                        );
                    })}
                </>
            )}

            {allRoundsData && allRoundsData.map((round, idx) => {
                if (!round.guess) return null;
                const roundColor = `hsl(${(idx * 137.5) % 360}, 70%, 50%)`;

                const customGuessIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${roundColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${roundColor}80; display:flex; align-items:center; justify-content:center; color:white; font-size: 8px; font-weight:bold;">${idx + 1}</div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });

                return (
                    <React.Fragment key={idx}>
                        <Marker position={[round.actual.lat, round.actual.lng]} icon={modernActualIcon}>
                            <Popup className="custom-popup">
                                <span className="font-semibold text-neutral-800">
                                    Round {idx + 1}: {round.actual.city}, {translateCountry(round.actual.country)}
                                </span>
                            </Popup>
                        </Marker>

                        <Marker position={[round.guess.lat, round.guess.lng]} icon={customGuessIcon}>
                            <Popup className="custom-popup">
                                <div className="flex flex-col items-center">
                                    <span style={{ color: roundColor }} className="font-bold border-b pb-1 mb-1">Round {idx + 1}</span>
                                    <span className="font-mono text-xs text-neutral-600">
                                        Score: {round.score}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>

                        <Polyline
                            positions={[
                                [round.guess.lat, round.guess.lng],
                                [round.actual.lat, round.actual.lng],
                            ]}
                            color={roundColor}
                            weight={3}
                            opacity={0.8}
                            dashArray="4, 4"
                        />
                    </React.Fragment>
                );
            })}

            {/* Display multiplayer guesses for summary view if available */}
            {allRoundsData && multiplayerData && multiplayerData.map(p => {
                if (!p.guess) return null; // Fallback to last guess if we don't have full history per round

                const pIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${p.color}aa; backdrop-filter: blur(4px); width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${p.color}; box-shadow: 0 0 10px ${p.color}; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: white; opacity: 0.8;">${p.name ? p.name[0].toUpperCase() : '?'}</div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                return (
                    <React.Fragment key={`summary-${p.id}`}>
                        <Marker position={[p.guess.lat, p.guess.lng]} icon={pIcon}>
                            <Popup className="custom-popup">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold border-b pb-1 mb-1" style={{ color: p.color }}>{p.name}</span>
                                    <span className="font-mono text-xs text-neutral-600">Total: {p.score} pts</span>
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                )
            })}
        </MapContainer>
    );
});

export default GameMap;
