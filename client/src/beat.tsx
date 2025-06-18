// client/src/client/BeatVisualizer.tsx

import React, { useState, useEffect, useRef } from "react";
import useConductor from "./client/useConductor";

// You can adjust these as you like
const VISIBLE_BEATS = 8;  // How many beats are visible at once
const BEAT_WINDOW = 0.1;  // How wide the "window" is, as a fraction of a beat

type BeatVisualizerProps = {
    state: any;      // Use your actual ClientState type if you have it
    dispatch: any;   // Use your actual ActionDispatch type if you have it
};

const BeatVisualizer: React.FC<BeatVisualizerProps> = ({ state, dispatch }) => {
    const getBeat = useConductor(state, dispatch);
    const [beatInfo, setBeatInfo] = useState({ beat: 0, offset: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setBeatInfo(getBeat());
        }, 16); // ~60fps
        return () => clearInterval(interval);
    }, [getBeat]);

    // Generate enough beats to scroll smoothly (always starting from 0)
    const totalBeats = Math.max(20, beatInfo.beat + 10);
    const beatWidthPx = 100; // Fixed width per beat in pixels

    // Scroll to keep current beat centered
    useEffect(() => {
        if (containerRef.current) {
            const currentBeatPosition = (beatInfo.beat + beatInfo.offset) * beatWidthPx;
            const containerWidth = containerRef.current.clientWidth;
            const scrollLeft = currentBeatPosition - containerWidth / 2;
            containerRef.current.scrollLeft = scrollLeft;
        }
    }, [beatInfo]);

    return (
        <div 
            style={{ 
                margin: 20,
                position: "relative",
                width: "100%",
            }}
        >
            <div
                ref={containerRef}
                style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    height: 80,
                    overflowX: "hidden",
                    position: "relative",
                }}
            >
                {Array.from({ length: totalBeats }).map((_, i) => {
                    const beatNumber = i; // Always start from 0 and increment
                    const isCurrent = beatNumber === beatInfo.beat;
                    
                    return (
                        <div
                            key={`beat-${beatNumber}`}
                            style={{
                                width: beatWidthPx,
                                height: 80,
                                background: isCurrent ? "#ff0" : "#333",
                                position: "relative",
                                borderRadius: 4,
                                border: "1px solid #888",
                                overflow: "hidden",
                                marginRight: "2px",
                                flexShrink: 0,
                            }}
                        >
                            {/* Beat window visualization */}
                            <div
                                style={{
                                    position: "absolute",
                                    left: `${(0.5 - BEAT_WINDOW) * 100}%`,
                                    width: `${BEAT_WINDOW * 2 * 100}%`,
                                    top: 0,
                                    bottom: 0,
                                    background: "rgba(0,255,0,0.2)",
                                    pointerEvents: "none",
                                }}
                            />
                            <span
                                style={{
                                    position: "absolute",
                                    bottom: 4,
                                    left: 0,
                                    right: 0,
                                    textAlign: "center",
                                    color: "#fff",
                                    fontSize: 12,
                                    userSelect: "none",
                                }}
                            >
                                {beatNumber}
                            </span>
                        </div>
                    );
                })}
            </div>
            
            {/* Fixed red line in the center */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: "#f00",
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                }}
            />
        </div>
    );
};

export default BeatVisualizer;