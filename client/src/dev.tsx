import BeatVisualizer from "./beat";
import useGameState from "./client/useGameState";
import type { GameState } from "./types";

export function Dev({ gameState }: { gameState: GameState }) {
    const [state, dispatch] = useGameState();
    console.log('client state', state)
    console.log('state', gameState)
    return (
        <div
            className="fixed bottom-4 right-4 left-4 top-3/4 z-[1000] bg-white/90 border border-gray-300 rounded-lg px-4 py-2 shadow-md text-sm"
            style={{ pointerEvents: "auto" }}
        >
            <strong>Dev Tools</strong>
            {/* Add dev tool controls here */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
                <div>entities</div>
                <div className="flex flex-col">{gameState.entities?.map(entity => <div key={entity.id}><span>{entity.id}</span></div>)}</div>
                <div>move</div>
                <div>{state.turnCount}</div>
            </div>
            <BeatVisualizer state={state} dispatch={dispatch} />
        </div>
    )
}