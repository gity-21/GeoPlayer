import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';

export default function RotatingGlobe() {
    const globeRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);

    // Dynamic sizing to fit the container
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        // Initial size
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Set auto-rotation
    useEffect(() => {
        if (globeRef.current && globeRef.current.controls()) {
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = 1.5;
            // Disable zoom and pan to keep it looking like a UI element
            globeRef.current.controls().enableZoom = false;
            globeRef.current.controls().enablePan = false;
        }
    }, [dimensions]); // Re-apply when dimension changes and component mounts

    return (
        <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
            {dimensions.width > 0 && (
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    backgroundColor="rgba(0,0,0,0)"
                    showAtmosphere={true}
                    atmosphereColor="#d4d4d8"
                    atmosphereAltitude={0.18}
                    globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark.jpg"
                    bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
                    polygonsData={[]}
                />
            )}
        </div>
    );
}
