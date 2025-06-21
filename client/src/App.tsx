import useClient from "./client/useClient";
import Board from "./board";
import MovingBars from "./board/MovingBars";
import { StartScreen } from "./views/startScreen";

<<<<<<< HEAD
export default function App() {
  const [connected, started, send, view] = useClient();
=======
function App() {
  const [ws, conductor, view] = useClient();
>>>>>>> origin/main

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
        <Board gameState={view} />
      </div>
      {/* <MovingBars duration={2} /> */}
    </div>
  );
}
