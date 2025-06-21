import useGameState from "../client/useGameState";
import type { GameState } from "../types";
import { Heart } from "./heart";


export function Health({ gameState }: { gameState: GameState }) {
    const [state, dispatch] = useGameState();
    const self = gameState.entities.find(entity => entity.type === "player" && entity.you == true)
    return (
        <>
            <div className="absolute top-8 left-8 flex gap-4">
                {[...Array(self.health)].map((_, i) => (
                    <Heart key={`heart-${i}`} />
                ))}
            </div>
        </>
    )
}