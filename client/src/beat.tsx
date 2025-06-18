// client/src/client/BeatVisualizer.tsx

import React, { useState, useEffect } from "react";
import useConductor from "./client/useConductor";

// You can adjust these as you like
const NUM_BEATS = 8;      // How many beats to show
const BEAT_WINDOW = 0.1;  // How wide the "window" is, as a fraction of a beat

type BeatVisualizerProps = {
    state: any;      // Use your actual ClientState type if you have it
    dispatch: any;   // Use your actual ActionDispatch type if you have it
};

const BeatVisualizer: React.FC<BeatVisualizerProps> = ({ state, dispatch }) => {
    const getBeat = useConductor(state, dispatch);
    const [beatInfo, setBeatInfo] = useState({ beat: 0, offset: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setBeatInfo(getBeat());
        }, 16); // ~60fps
        return () => clearInterval(interval);
    }, [getBeat]);

    return (
        <div style={{ display: "flex", alignItems: "center", margin: 20 }}>
            {Array.from({ length: NUM_BEATS }).map((_, i) => {
                const beatNumber = beatInfo.beat + i - Math.floor(NUM_BEATS / 2);
                const isCurrent = beatNumber === beatInfo.beat;
                return (
                    <div
                        key={i}
                        style={{
                            width: 40,
                            height: 80,
                            margin: 2,
                            background: isCurrent ? "#ff0" : "#333",
                            position: "relative",
                            borderRadius: 4,
                            border: "1px solid #888",
                            overflow: "hidden",
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
                        {/* Marker for current position within the beat */}
                        {isCurrent && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: `${(beatInfo.offset + 0.5) * 100}%`, // offset is -0.5 to 0.5
                                    top: 0,
                                    bottom: 0,
                                    width: 2,
                                    background: "#f00",
                                    pointerEvents: "none",
                                }}
                            />
                        )}
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
    );
};

export default BeatVisualizer;