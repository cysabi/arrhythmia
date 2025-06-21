import { useState } from "react";
import type { GameState, Player } from "../types";
import { Dev } from "./dev";
import { Health } from "./health";

export function Hud({ devFlag, gameState }: { devFlag?: boolean | undefined, gameState: GameState }) {
    const [fakeHearts, setFakeHearts] = useState(5);
    const self = gameState.entities.find(entity => entity.type === "player" && entity.you == true) as Player
    self.health = fakeHearts;
    return (
        <>
            <Health player={self} size="big" hoverOnly={false} />
            <button onClick={() => { setFakeHearts(x => x + 1) }}>bump</button>
            {devFlag && <Dev gameState={gameState} />}
        </>
    )
}