import { useEffect, useState } from "react";
const SIZER = {
    smol: 'h-3 w-3',
    big: "h-8 w-8"
}

export function FancyHeart({ isAnimating, direction, size, onAnimationComplete }: { isAnimating: boolean, direction: 'filling' | 'emptying', size: 'smol' | 'big', onAnimationComplete: () => void }) {
    const [currentFrame, setCurrentFrame] = useState(4);

    useEffect(() => {
        if (!isAnimating) return;

        const frames = direction === 'filling' ? [1, 2, 3, 4] : [3, 2, 1];
        let frameIndex = 0;

        const interval = setInterval(() => {
            setCurrentFrame(frames[frameIndex]);
            frameIndex++;
            if (frameIndex >= frames.length) {
                clearInterval(interval);
                onAnimationComplete?.();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isAnimating, direction]);


    return (
        <div className={SIZER[size]}>
            <img src={`/hearts/${isAnimating ? currentFrame : '4'}-4.svg`} alt="fancy-heart" className="transition-opacity duration-150 w-full h-full object-contain" />
        </div>
    );
}