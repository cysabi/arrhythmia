import Board from "./BoardView";
import useWebsocket from "./WebSocketClient/useWebsocket";
import { sampleGameState } from "./GameStateManager/game-logic";

function App() {
  const [connected, send] = useWebsocket();

  if (!connected) {
    return <div>connecting...</div>;
  }

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
        <Board gameState={sampleGameState} />
      </div>
    </div>
  );
}

export default App;
