import { useEffect, useRef, useState } from "react";
import type { Player } from "../types";
import { FancyHeart } from "./fancy-heart";

// what I want when you change a heart it should flash for (n) seconds before appearing solidly.

const SIZER = {
    smol: 'gap-1 inset-x-0 top-0',
    big: 'gap-4 top-4 left-4'
}

export function Health({ player, size, hoverOnly = false }: { player: Player, size: 'smol' | 'big', hoverOnly: boolean }) {
    const [isFlashing, setIsFlashing] = useState(false);

    const prevHealth = useRef(player.health);
    const [animatingHeart, setAnimatingHeart] = useState<{
        index: number;
        direction: 'filling' | 'emptying';
    } | null>(null);

    useEffect(() => {
        const currentHealth = player.health;
        const previousHealth = prevHealth.current;

        if (currentHealth !== previousHealth) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 2000);
            setTimeout(() => {
                if (currentHealth > previousHealth) {
                    setAnimatingHeart({
                        index: currentHealth - 1,
                        direction: 'filling'
                    });
                } else {
                    setAnimatingHeart({
                        index: previousHealth - 1,
                        direction: 'emptying'
                    });
                }
            }, 50);
            prevHealth.current = currentHealth;
        }
    }, [player.health]);

    const onAnimationComplete = () => {
        setAnimatingHeart(null);
    };

    return (
        <>
            <div className={`absolute flex items-center cursor-pointer ${SIZER[size]} ${hoverOnly && !isFlashing ? 'group-hover:opacity-100 group-hover:-translate-y-2 group-hover:scale-120 transition duration-300 opacity-0' : ''}`}>
                {[...Array(animatingHeart?.direction === 'emptying' ? player.health + 1 : player.health)].map((_, i) => (
                    <FancyHeart
                        key={`heart-${i}`}
                        size={size}
                        isAnimating={animatingHeart?.index === i}
                        direction={animatingHeart?.direction ?? 'filling'}
                        onAnimationComplete={onAnimationComplete}
                    />
                ))}
            </div>
        </>
    )
}