import { BOMB_TIME } from "../client/gameDefaults";
import { Health } from "../hud/health";
import type { Entity } from "../types";
import projBasic from "/projectile-basic.svg";
import projBomb from "/projectile-bomb.svg";
import projBomb2 from "/projectile-bomb2.svg";
import projDiag from "/projectile-diag_cross.svg";
import projAsplode from "/projectile-asplode.svg";

export const Player = ({
  entity,
  tooltipData: { feedback, playerId },
}: {
  entity: Extract<Entity, { type: "player" }>;
  tooltipData: { playerId: string; feedback: string };
}) => {
  const { health } = entity;

  const avatarId = assignAvatarId(entity.id);

  const rotate = { up: "180deg", down: "0deg", left: "90deg", right: "-90deg" }[
    entity.facing
  ];

  let color = "text-red-600";
  if (feedback.includes("early")) {
    color = "text-cyan-600";
  }
  if (feedback.includes("late")) {
    color = "text-purple-600";
  }

  return (
    <div className="relative group cursor-pointer">
      {entity.id === playerId && (
        <div className="absolute inset-0 -translate-y-full flex items-end justify-center text-center">
          <div
            className={`whitespace-nowrap font-['Press_Start_2P'] uppercase text-xs ${color}`}
          >
            {feedback}
          </div>
        </div>
      )}
      <div className="absolute inset-0 flex flex-col items-center translate-y-[100%]">
        <Health player={entity} size="smol" onPlayer={true} />
      </div>
      <div style={{ rotate }}>
        {health > 0 ? getAvatar(avatarId) : <Skull />}
      </div>
    </div>
  );
};

export const Projectile = ({
  entity,
  turnCount,
}: {
  entity: Extract<Entity, { type: "projectile" }>;
  turnCount: number;
}) => {
  const dir = [entity.facing];
  if (entity.diagFacing) dir.push(entity.diagFacing);
  dir.sort();

  let src = {
    spread: "",
    basic: projBasic,
    bomb: projBomb,
    diag_cross: projDiag,
    asplode: projAsplode,
  }[entity.projectileType];

  if (
    entity.projectileType === "bomb" &&
    entity.birthTurn - turnCount < -BOMB_TIME
  )
    src = projBomb2;

  return (
    <img
      src={src}
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

import skull from "/skull.svg";
export const Skull = () => {
  return <img src={skull} alt="skull" />;
};

import wall from "/wall.svg";
export const Wall = () => {
  return <img src={wall} alt="wall" />;
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

import binkicolor from "/binkicolor.svg";
import hemmetcolor from "/hemmetcolor.svg";
import binkiwin from "/binkiwin.svg";
import hemmetwin from "/hemmetwin.svg";

export const getAvatar = (avatarId: number) => {
  return avatarId ? (
    <img src={binkicolor} alt="player1" />
  ) : (
    <img src={hemmetcolor} alt="player2" />
  );
};

export const getWinAvatar = (avatarId: number) => {
  return avatarId ? (
    <img src={binkiwin} alt="player1" />
  ) : (
    <img src={hemmetwin} alt="player2" />
  );
};
