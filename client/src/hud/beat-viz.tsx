import React, { useState, useEffect, useRef } from "react";
import useConductor from "../client/useConductor";
import type { ClientEvent, ClientState } from "../client/useGameState";

const BEAT_WINDOW = 0.1;

export function BeatVisualizer({ state, dispatch }: {
    state: ClientState;
    dispatch: React.ActionDispatch<[event: ClientEvent]>;
}) {
    const getBeat = useConductor(state, dispatch);
    const [beatInfo, setBeatInfo] = useState({ beat: 0, offset: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setBeatInfo(getBeat());
        }, 16);
        return () => clearInterval(interval);
    }, [getBeat]);

    const totalBeats = Math.max(20, beatInfo.beat + 10);
    const beatWidthPx = 100;

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
                    const beatNumber = i;
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
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none -translate-x-1/2 z-10" />
        </div>
    );
};