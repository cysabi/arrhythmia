import useClient from "./client/useClient";
import Board from "./board";
import { BeatBar } from "./hud/BeatBar";
import { StartScreen } from "./views/startScreen";
import { GameOverScreen } from "./views/gameOverScreen";
import { Hud } from "./hud/hud";
import type { GameState, Player } from "./types";
import OpponentHealth from "./hud/opponentHealth";

const getWinner = (view: GameState): Player | null => {
  const { entities } = view;
  const playersAlive: Player[] = entities.filter(
    (e): e is Player => e.type === "player" && e.health > 0
  );
  return playersAlive.length === 1 ? playersAlive[0] : null;
};

function App() {
  const { ws, conductor, view, tooltipData } = useClient();

  if (!ws.connected) {
    return "connecting...";
  }

  if (conductor.status !== "playing") {
    return <StartScreen status={conductor.status} send={ws.send} />;
  }

  const winner = getWinner(view);
  if (winner) {
    return <GameOverScreen winner={winner}></GameOverScreen>;
  }

  return (
    <div className="h-svh w-svw flex flex-col">
      <OpponentHealth gameState={view} />
      <div className="flex-grow">
        <Board gameState={view} tooltipData={tooltipData} />
        <Hud devFlag={false} gameState={view} />
      </div>
      <BeatBar barProps={conductor.barProps} />
    </div>
  );
}

export default App;
