import useClient from "./client/useClient";
import Board from "./board";

function App() {
  const [connected, view] = useClient();

  if (!connected) {
    return "connecting...";
  }

  return (
    <div className="h-svh w-svw flex flex-col">
      <div className="flex-grow">
        <Board gameState={view} />
      </div>
    </div>
  );
}

export default App;
