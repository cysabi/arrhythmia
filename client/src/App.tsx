import Board from "./BoardView";
import { useClient } from "./WebSocketClient/client";

function App() {
  const { view, act } = useClient();
  // TODO: bind keyboard inputs to act to send a move

  return (
    <div className="h-svh w-svw flex flex-col">
      <div>
        <button
          onClick={() => {
            act("moveRight");
          }}
        >
          MOVE RIGHT
        </button>
      </div>
      <div className="flex-grow">
        <Board gameState={view} />
      </div>
    </div>
  );
}

export default App;
