import { useEffect, useRef, useState } from "react";
import type { GameState, Player } from "../types";
import { FancyHeart } from "./fancy-heart";
import { getAvatar } from "../board/entities";

const SIZER = {
  smol: "gap-1 inset-x-0 top-0",
};

export default function Opponent({
  gameState,
}: {
  devFlag?: boolean | undefined;
  gameState: GameState;
}) {
  const opponents: Player[] = gameState.entities.filter(
    (entity) => entity.type === "player" && entity.you == false
  ) as Player[];

  return (
    <>
      <div>
        {opponents.map((opponent) => (
          <div className="flex ">
            <div className="" style={{ scale: 0.25 }}>
              {getAvatar(Number(opponent.id))}
            </div>
            <div>{opponent.health}</div>
          </div>
        ))}
      </div>
    </>
  );
}
