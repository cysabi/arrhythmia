import type { GameState, Player } from "../types";
import { Health } from "./health";

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
    <>
      <div className="bottom 0vh">
        <Health player={self} size="big" />
      </div>
    </>
  );
}
