import Board from "./BoardView";
import useWebsocket from "./WebSocketClient/useWebsocket";
import { useClient } from "./WebSocketClient/client";

function App() {
  const view = useClient();
  // TODO: bind keyboard inputs to game engine callback to send a move

  return (
    <div className="h-svh w-svw flex flex-col">
      <div>
        <button
          onClick={() => {
            send(
              JSON.stringify({
                playerId: "1",
                turnCount: 0,
                action: "moveLeft",
              })
            );
          }}
        >
          Send
        </button>
      </div>
      <div className="flex-grow">
        <Board gameState={view} />
      </div>
    </div>
  );
}

export default App;
