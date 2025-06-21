import { useEffect, useRef, useState } from "react";
import type { Player } from "../types";
import { FancyHeart } from "./fancy-heart";

// what I want when you change a heart it should flash for (n) seconds before appearing solidly.

const SIZER = {
    smol: 'gap-1',
    big: "gap-4"
}

export function Health({ player, size, hoverOnly = false }: { player: Player, size: 'smol' | 'big', hoverOnly: boolean }) {
    const prevHealth = useRef(player.health);
    const [animatingHeart, setAnimatingHeart] = useState<{
        index: number;
        direction: 'filling' | 'emptying';
    } | null>(null);

    useEffect(() => {
        const currentHealth = player.health;
        const previousHealth = prevHealth.current;

        if (currentHealth !== previousHealth) {
            if (currentHealth > previousHealth) {
                // Health increased - animate the new heart filling
                setAnimatingHeart({
                    index: currentHealth - 1, // Zero-indexed
                    direction: 'filling'
                });
            } else {
                // Health decreased - animate the lost heart emptying
                setAnimatingHeart({
                    index: previousHealth - 1,
                    direction: 'emptying'
                });
            }
            prevHealth.current = currentHealth;
        }
    }, [player.health]);

    const onAnimationComplete = () => {
        setAnimatingHeart(null);
    };

    return (
        <>
            <div className={`absolute flex cursor ${SIZER[size]} ${hoverOnly ? 'group-hover:opacity-100 group-hover:-translate-y-4 group-hover:scale-120 transition duration-300 opacity-0' : ''}`}>
                {[...Array(animatingHeart?.direction === 'emptying' ? player.health + 1 : player.health)].map((_, i) => (
                    <FancyHeart
                        key={`heart-${i}`}
                        size={size}
                        isAnimating={animatingHeart?.index === i}
                        direction={'filling'}
                        onAnimationComplete={onAnimationComplete}
                    />
                ))}
            </div>
        </>
    )
}