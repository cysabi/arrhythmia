import useClient from "./client/useClient";
import Board from "./board";
import { StartScreen } from "./views/startScreen";

function App() {
  const [connected, started, send, view] = useClient();

  if (!connected) {
    return "connecting...";
  }

  if (started !== true) {
    console.log({ send: send.toString() });
    return <StartScreen />;
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
