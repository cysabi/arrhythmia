import useClient from "./client/useClient";
import Board from "./board";
import BeatBarSpawner from "./board/BeatBarSpawner";
import { StartScreen } from "./views/startScreen";
import { Hud } from "./hud/hud";

function App() {
  const { ws, conductor, view, tooltipData } = useClient();

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
  return (
    <div className="h-svh w-svw flex flex-col">
      <div className="flex-grow">
        <Board gameState={view} tooltipData={tooltipData} />
        <Hud devFlag={false} gameState={view} />
      </div>
      <BeatBarSpawner />
    </div>
  );
}

export default App;
