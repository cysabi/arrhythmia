import React from "react";
import Board from "./components/Board/Board";
import type { TurnPayload } from "./types";
import useWebsocket from "./useWebsocket";

export const sampleTurnList: TurnPayload[] = [
  {
    playerId: "1",
    turnCount: 0,
    action: "moveLeft",
    checksum: "abc123",
  },
  {
    playerId: "2",
    turnCount: 0,
    action: "shoot",
    checksum: "abc123",
  },
  {
    playerId: "1",
    turnCount: 1,
    action: "skip",
    checksum: "abc1234",
  },
  {
    playerId: "2",
    turnCount: 1,
    action: "moveDown",
    checksum: "abc1234",
  },
];

function App() {
  const [connected, send] = useWebsocket();

  if (!connected) {
    return <div>connecting...</div>;
  }

  return (
    <>
      <button
        onClick={() => {
          send(
            JSON.stringify({
              playerId: "1",
              turnCount: 0,
              action: "moveLeft",
              checksum: "abc123",
            })
          );
        }}
      >
        Send
      </button>
      <Board />
    </>
  );
}

export default App;
