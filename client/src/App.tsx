import useClient from "./client/useClient";
import Board from "./board";
import MovingBars from "./board/MovingBars";
import { StartScreen } from "./views/startScreen";

export default function App() {
  const [connected, started, send, view] = useClient();

  if (!connected) {
    return "connecting...";
  }

  if (started !== true) {
    return (
      <div className="flex items-center gap-5">
        <StartScreen send={send} />
      </div>
    );
  }

  return (
    <div className="h-svh w-svw flex flex-col">
      <div className="flex-grow">
        <Board gameState={view} />
      </div>
      <MovingBars duration={2} />
    </div>
  );
}

function BeatDisplay() {
  return <div></div>;
}
