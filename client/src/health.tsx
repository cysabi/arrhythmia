import useGameState from "./client/useGameState";
import type { GameState } from "./types";

export function Heart() {
    return (
        <div className="h-8 w-8">
            <img src="/heart.png" alt="player" className="w-full h-full object-contain" />
        </div>
    )
}

export function Health({ gameState }: { gameState: GameState }) {
    const [state, dispatch] = useGameState();
    //const self = gameState.entities.find(entity => entity.id = state.playerId)

    // hardcoded
    const self = { id: '', position: [2, 2], facing: "right", type: "player", health: 5 }
    return (
        <div className="absolute top-8 left-8 flex gap-4">
            {[...Array(self.health)].map((_, i) => (
                // <span key={i} className="inline-block w-4 h-4 bg-red-500 rounded-full mr-1"></span>
                <Heart />
            ))}
        </div>
    )
}