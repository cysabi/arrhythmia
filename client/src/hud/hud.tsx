import type { GameState } from "../types";
import { Dev } from "./dev";
import { Health } from "./health";

export function Hud({ devFlag, gameState }: { devFlag?: boolean | undefined, gameState: GameState }) {
    console.log('hud on')
    return (
        <>
            <Health gameState={gameState} />
            {devFlag && <Dev gameState={gameState} />}
        </>
    )
}