import useClient from "./client/useClient";
import Board from "./board";
import { StartScreen } from "./views/startScreen";
import { Hud } from "./hud/hud";

function App() {
  const [connected, started, send, view] = useClient();

  if (!connected) {
    return "connecting...";
  }

  if (started !== true) {
    return (
      <div className="flex items-center gap-5">
        <StartScreen />
        <button onClick={() => send("start")}>start!</button>
      </div>
    );
  }
  return (
    <div className="h-svh w-svw flex flex-col">
      <div className="flex-grow">
        <Board gameState={view} />
        <Hud devFlag={false} gameState={view} />
      </div>
    </div>
  );
}

export default App;
