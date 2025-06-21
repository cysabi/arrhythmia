import type { GameState, Player } from "../types";
import { Dev } from "./dev";
import { Health } from "./health";

export function Hud({ devFlag, gameState }: { devFlag?: boolean | undefined, gameState: GameState }) {
    const self = gameState.entities.find(entity => entity.type === "player" && entity.you == true) as Player
    return (
        <>
            <Health player={self} size="big" hoverOnly={false} />
            {devFlag && <Dev gameState={gameState} />}
        </>
    )
}