import type { GameState, Player } from "../types";
import { Health } from "./health";

import binkiwin from "/binkiwin.svg";
import hemmetwin from "/hemmetwin.svg";

export function Hud({
  gameState,
}: {
  devFlag?: boolean | undefined;
  gameState: GameState;
}) {
  const self = gameState.entities.find(
    (entity) => entity.type === "player" && entity.you == true
  ) as Player;

  return (
    <div className="flex items-center gap-4">
      <div className="h-24">
        {self.avatarId ? (
          <img className="h-full" src={binkiwin} alt="player1" />
        ) : (
          <img className="h-full" src={hemmetwin} alt="player2" />
        )}
      </div>
      <div className="translate-y-3">
        <Health player={self} size="big" />
      </div>
    </div>
  );
}
