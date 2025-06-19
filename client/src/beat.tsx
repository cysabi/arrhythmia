// client/src/client/BeatVisualizer.tsx

import React, { useState, useEffect, useRef } from "react";
import useConductor from "./client/useConductor";
import type { ClientEvent, ClientState } from "./client/useGameState";

// You can adjust these as you like
const BEAT_WINDOW = 0.1;  // How wide the "window" is, as a fraction of a beat

type BeatVisualizerProps = {
    state: ClientState;      // Use your actual ClientState type if you have it
    dispatch: React.ActionDispatch<[event: ClientEvent]>;   // Use your actual ActionDispatch type if you have it
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
        <div className="m-5 relative w-full">
            <div
                ref={containerRef}
                className="flex items-center w-full h-20 overflow-x-hidden relative"
            >
                {Array.from({ length: totalBeats }).map((_, i) => {
                    const beatNumber = i; // Always start from 0 and increment
                    const isCurrent = beatNumber === beatInfo.beat;

                    return (
                        <div
                            key={`beat-${beatNumber}`}
                            className={`relative rounded border border-gray-600 overflow-hidden mr-0.5 flex-shrink-0 ${isCurrent ? "bg-yellow-400" : "bg-gray-800"
                                }`}
                            style={{
                                width: beatWidthPx,
                                height: 80,
                            }}
                        >
                            {/* Beat window visualization */}
                            <div
                                className="absolute top-0 bottom-0 bg-green-500/20 pointer-events-none"
                                style={{
                                    left: `${(0.5 - BEAT_WINDOW) * 100}%`,
                                    width: `${BEAT_WINDOW * 2 * 100}%`,
                                }}
                            />
                            <span className="absolute bottom-1 left-0 right-0 text-center text-white text-xs select-none">
                                {beatNumber}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Fixed red line in the center */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none -translate-x-1/2 z-10" />
        </div>
    );
};

export default BeatVisualizer;