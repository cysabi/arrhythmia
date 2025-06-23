import useClient from "./client/useClient";
import Board from "./board";
import BeatBarSpawner from "./board/BeatBarSpawner";
import { StartScreen } from "./views/startScreen";
import { GameOverScreen } from "./views/gameOverScreen";
import { Hud } from "./hud/hud";
import type { GameState, Player } from "./types";

const getWinner = (view: GameState): Player | null => {
  const { entities } = view;
  const playersAlive: Player[] = entities.filter(
    (e): e is Player => e.type === "player" && e.health > 0
  );
  return playersAlive.length === 1 ? playersAlive[0] : null;
};

function App() {
  const [ws, conductor, view] = useClient();

  if (!ws.connected) {
    return "connecting...";
  }

  if (conductor.status !== "playing") {
    return (
      <div className="flex items-center gap-5">
        <StartScreen status={conductor.status} send={ws.send} />
      </div>
    );
  }

  const winner = getWinner(view);
  if (winner) {
    return <GameOverScreen winner={winner}></GameOverScreen>;
  }

  return (
    <div className="h-svh w-svw flex flex-col">
      <div className="flex-grow">
        <Board gameState={view} />
        <Hud devFlag={false} gameState={view} />
      </div>
      <BeatBarSpawner />
    </div>
  );
}

export default App;
