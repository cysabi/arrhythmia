import useClient from "./client/useClient";
import Board from "./board";
import { Health } from "./health";

function App() {
  const [connected, started, send, view] = useClient();

  if (!connected) {
    return "connecting...";
  }

  if (started !== true) {
    return (
      <div className="flex items-center gap-5">
        <div>start?</div>
        <button onClick={() => send("start")}>start!</button>
      </div>
    );
  }

  return (
    <div className="h-svh w-svw flex flex-col">
      <div className="flex-grow">
        <Board gameState={view} />
        <Health gameState={view} />
      </div>
    </div>
  );
}

export default App;
