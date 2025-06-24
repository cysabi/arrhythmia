import { Health } from "../hud/health";
import type { Entity } from "../types";

export const Player = ({
  entity,
  tooltipData: { feedback, playerId },
}: {
  entity: Extract<Entity, { type: "player" }>;
  tooltipData: { playerId: string; feedback: string };
}) => {
  const avatarId = assignAvatarId(entity.id);

  const rotate = { up: "180deg", down: "0deg", left: "90deg", right: "-90deg" }[
    entity.facing
  ];

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
      <Health player={entity} size="smol" onPlayer={true} />
      <div style={{ rotate }}>{getAvatar(avatarId)}</div>
    </div>
  );
};

export const Projectile = ({
  entity,
}: {
  entity: Extract<Entity, { type: "projectile" }>;
}) => {
  // TODO
  // entity.facing
  // entity.diagFacing
  const dir = [entity.facing];
  if (entity.diagFacing) dir.push(entity.diagFacing);
  dir.sort();

  console.log({ dir });

  return (
    <img
      src="/fireballtail.svg"
      alt="A projectile"
      style={{
        rotate: `${
          {
            up: 0,
            down: 90 * 2,
            left: 90 * 3,
            right: 90,
            downleft: 45 * -3,
            downright: 45 * 3,
            leftup: 45 * -1,
            rightup: 45 * 1,
          }[dir.join("")]
        }deg`,
      }}
    />
  );
};

export const Skull = () => {
  return <img src="/skull.svg" alt="skull" />;
};

export const Wall = () => {
  return <img src="/floor.svg" alt="wall" />;
};

export const getPlayerNumber = (
  playerId: Extract<Entity, { type: "player" }>["id"]
): number => {
  return parseFloat(playerId.split("_")[1]) - 100; // why do player ids start at 100?
};

export const assignAvatarId = (
  playerId: Extract<Entity, { type: "player" }>["id"]
): number => {
  // assign one of 2 avatars
  return getPlayerNumber(playerId) % 2;
};

export const getAvatar = (avatarId: number) => {
  return avatarId ? (
    <img src="/binki.svg" alt="player1" />
  ) : (
    <img src="/hemmet.svg" alt="player2" />
  );
};

export const getWinAvatar = (avatarId: number) => {
  return avatarId ? (
    <img src="/binkiwin.svg" alt="player1" />
  ) : (
    <img src="/hemmetwin.svg" alt="player2" />
  );
};
