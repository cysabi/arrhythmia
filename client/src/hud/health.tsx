import useGameState from "../client/useGameState";
import type { GameState } from "../types";
import { Heart } from "./heart";


export function Health({ gameState }: { gameState: GameState }) {
    const [state, dispatch] = useGameState();
    const alt = gameState.entities.find(entity => entity.id = state.playerId)

    // TODO: remove hardcode
    const self = { id: '', position: [2, 2], facing: "right", type: "player", health: 5 }
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