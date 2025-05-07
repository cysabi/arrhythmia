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
    action: "shootFire",
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
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
}

export default App;
