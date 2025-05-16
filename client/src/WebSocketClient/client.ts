import type { GameState } from "../types";

// on client:
// construct history of turns

// turn - the collection of actions that players do at the same time??
// t     
// 0          P         < queue()                   add player action to queue, dont run progressGame
// 0          .
// 0          .
// 1 --e-e-e--p-------  < tick(loop applyAction())  move entities + do queued player actions
// 1            ^?
// 1            Pp      < applyAction()             do player action
// 1
// 1

// ActionPayload { player + turnNumber + action }
// Action { move }

// 
//  TODO: distinguish optimistic client vs confirmed by server actions

// 	- take snapshots all the way up to the last filled turn
// 	- have turn buffer


//  - on (websocket message)
//    - if overrides optimistic: rollback
//    - if fills in, save snapshot?

// 	- on (action): <- play move
// 		- if early : ActionsQueue += action
// 		- if late  : progressGame(action)

//  - on tick  : progressGame(ActionsQueue)

export type GlobalState = {
  pendingTurns: ActionPayload[];
  snapshots: Record<number, GameState>;
};


declare var turnBuffer: ActionPayload[];

declare function messageToPayload(msg: string): ActionPayload;

// will find all moves from turnBuffer[currentMoveIndex] AND selfmove and apply to game
const gameTick = (
  game: Entities,
  turns: TurnsSinceSnapshot,
  selfTurn: ClientTurn
): Entities => {
  applyMove;
};

const processInput = (selfTurn: ClientTurn) => selfTurn;

const recieveMove = (t: ActionPayload): Entities => {
  addTurnToBuffer;
  if (true) {
    rollback;
  }
};

const addTurnToBuffer = (
  turns: TurnsSinceSnapshot,
  turn: ActionPayload
): TurnsSinceSnapshot => {};

const rollback = (snpashot: Entities, turns: TurnsSinceSnapshot): Entities => {
  applyMove;
};

declare function maybeSnapshot(
  game: Entities,
  turns: TurnsSinceSnapshot
): Entities;
