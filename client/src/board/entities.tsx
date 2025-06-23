import { Health } from "../hud/health";
import type { Entity } from "../types";

export const Player = ({
  entity,
  tooltipData: { feedback, playerId },
}: {
  entity: Extract<Entity, { type: "player" }>;
  tooltipData: { playerId: string; feedback: string };
}) => {
  const src =
    parseFloat(entity.id.split("_")[1]) % 2 ? "/binki.svg" : "/hemmet.svg";

  return (
    <div className="relative group cursor-pointer">
      {entity.id === playerId && (
        <div className="absolute inset-0 -translate-y-full flex items-end justify-center text-center">
          <div
            className={`whitespace-nowrap font-['Press_Start_2P'] uppercase text-xs ${
              feedback.includes("already") && "text-orange-600"
            } ${feedback.includes("early") && "text-cyan-600"} ${
              feedback.includes("late") && "text-purple-600"
            }`}
          >
            {feedback}
          </div>
        </div>
      )}
      <Health player={entity} size="smol" hoverOnly={true} />
      <img src={src} alt="player1" />
    </div>
  );
};

export const Projectile = ({
  entity,
}: {
  entity: Extract<Entity, { type: "projectile" }>;
}) => {
  return <img src="/trash.jpg" alt="A projectile" />;
};

export const Skull = () => {
  return <img src="/skull.svg" alt="skull" />;
};

export const Wall = () => {
  return <img src="/floor.svg" alt="wall" />;
};
