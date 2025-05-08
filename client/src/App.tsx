import React from "react";
import Board from "./components/Board/Board";
import type { TurnPayload } from "./types";

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
  const [turnList, setTurnList] = React.useState<TurnPayload[]>([]);
  
  let ws = React.useRef(null as WebSocket | null);
  React.useEffect(() => {
    // Create WebSocket connection.
    ws.current = new WebSocket("ws://localhost:5174/ws");

    // Listen for messages
    ws.current.addEventListener("message", (event) => {
      console.log(JSON.parse(event.data));
    });

    // clean up/close ws before calling next useEffect n making new connection
    return () => {
      console.log("closing ws");
      ws.current!.close();
    }
  }, []); // triggers once

  return (
    <>
    <button onClick={() => {
      ws.current!.send(JSON.stringify({
        playerId: "1",
        turnCount: 0,
        action: "moveLeft",
        checksum: "abc123",
      }));
    }}>Send</button>
      <Board />
    </>
  );
}

export default App;
