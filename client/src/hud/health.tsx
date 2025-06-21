import { useEffect, useRef, useState } from "react";
import type { Player } from "../types";
import { FancyHeart } from "./fancy-heart";

const SIZER = {
    smol: 'gap-1 inset-x-0 top-0',
    big: 'gap-4 top-4 left-4'
}

export function Health({ player, size, hoverOnly = false }: { player: Player, size: 'smol' | 'big', hoverOnly: boolean }) {
    const [isFlashing, setIsFlashing] = useState(false);
    const prevHealth = useRef(player.health);

    useEffect(() => {
        if (player.health !== prevHealth.current) {
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    prevHealth.current = player.health;
                });
            } else {
                prevHealth.current = player.health;
            }

            // Flash effect
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 2000);
        }
    }, [player.health]);

    // Determine visibility classes
    const shouldBeVisible = !hoverOnly || isFlashing;
    const shouldShowOnHover = hoverOnly && !isFlashing;

    const baseClasses = `absolute flex items-center cursor-pointer ${SIZER[size]}`;
    const visibilityClasses = shouldBeVisible
        ? 'opacity-100'
        : 'opacity-0 group-hover:opacity-100';
    const hoverEffects = shouldShowOnHover
        ? 'group-hover:-translate-y-2 group-hover:scale-110 transition duration-300'
        : '';
    const flashEffect = isFlashing ? 'animate-pulse' : '';

    return (
        <div className={`${baseClasses} ${visibilityClasses} ${hoverEffects} ${flashEffect}`}>
            {[...Array(player.health)].map((_, i) => (
                <FancyHeart
                    key={`heart-${i}`}
                    size={size}
                    style={{ viewTransitionName: `heart-${player.id}-${i}` }}
                />
            ))}
        </div>
    );
}