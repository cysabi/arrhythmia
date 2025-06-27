import { useEffect, useRef, useState } from "react";
import type { Player } from "../types";
import heart from "/heartgem.svg";
import beatbar from "./beatbar.module.css";

const SIZER = {
  smol: "gap-1 inset-x-0 top-0",
  big: "gap-4 top-4 left-4",
};

export function Health({
  player,
  size,
  onPlayer = false,
}: {
  player: Player;
  size: "smol" | "big";
  onPlayer?: boolean;
}) {
  if (!player) {
    player = {
      health: 5,
      id: "0",
    } as any;
  }

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
      setTimeout(() => setIsFlashing(false), 2500);
    }
  }, [player.health]);

  // Determine visibility classes
  const shouldBeVisible = !onPlayer || isFlashing;
  const baseClasses = `flex items-center ${SIZER[size]}`;
  const visibilityClasses = shouldBeVisible ? "opacity-100" : "opacity-0";
  const flashEffect = isFlashing ? beatbar.Shake : "";

  return (
    player.health > 0 && (
      <div className={baseClasses}>
        {[...Array(player.health)].map((_, i) => (
          <div
            style={{
              viewTransitionName: `${size}-heart-${player.id}-${i}`,
              animationDelay: `${i * 50}ms`,
            }}
            key={`heart-${i}`}
            className={`${
              {
                smol: "h-3 w-3",
                big: "h-8 w-8",
              }[size]
            } ${visibilityClasses} ${flashEffect}`}
          >
            <img
              style={{ scale: 2 }}
              src={heart}
              alt="fancy-heart"
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    )
  );
}
