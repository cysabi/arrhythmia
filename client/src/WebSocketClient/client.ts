import type { GameState } from "../types";
// - on client: construct history of turns

// 	- tick:
// 		- change entities
//      - ECS, for each C, run all E
// 		- if move, apply move
// 	- on input:
// 		- if timed well: play(turn)

type TurnPayload = {
  playerId: string;
  beatIndex: number;
  action: string;
};

// 	- take snapshots all the way up to the last filled turn
// 	- have turn buffer
type ClientTurn = TurnPayload;
type TurnsSinceSnapshot = TurnPayload[];
type Entities = GameState["entities"];

declare var turnBuffer: TurnPayload[];

declare function messageToPayload(msg: string): TurnPayload;

// will find all moves from turnBuffer[currentMoveIndex] AND selfmove and apply to game
const gameTick = (
  game: Entities,
  turns: TurnsSinceSnapshot,
  selfTurn: ClientTurn
): Entities => {
  applyMove;
};

const processInput = (selfTurn: ClientTurn) => selfTurn;

// play move wil add it to turnBuffer. then if the tick has already been run, apply to game immediately.

// 	- on recieve:
//      - add to turn buffer
// 		- if prev turn:
// 			- rollback to prev board state
// 			- reapply turn buffer
//  		- take? snapshot
// 		- else:
//          - playMove
//  		- take? snapshot
const recieveMove = (t: TurnPayload): Entities => {
  addTurnToBuffer;
  if (true) {
    rollback;
  }
};

const addTurnToBuffer = (
  turns: TurnsSinceSnapshot,
  turn: TurnPayload
): TurnsSinceSnapshot => {};

const rollback = (snpashot: Entities, turns: TurnsSinceSnapshot): Entities => {
  applyMove;
};

// start from snapshot, apply turns recieved from server, apply self move
const applyMove = (game: Entities, any: TurnPayload): Entities => {};

declare function maybeSnapshot(
  game: Entities,
  turns: TurnsSinceSnapshot
): Entities;
