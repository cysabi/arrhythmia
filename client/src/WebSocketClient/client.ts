import type { GameState } from "../types";
import type { ActionPayload } from "../types";

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
import { useState } from "react";
import { sampleGameState } from "../GameStateManager/game-logic";
import useWebsocket from "./useWebsocket";

type GlobalState = {
  displayedState: GameState;
  serverValidated: {
    gameState: GameState;
    actions: ActionPayload[];
  };
  pendingActions: ActionPayload[];
};

const globalState: GlobalState = {
  displayedState: {} as GameState, // TODO: replace with inital
  serverValidated: {
    gameState: {} as GameState, // snapshot of previous
    actions: [], // actions between serverValidated gameState and current
  },
//   pendingActions: [], // actions we have not added to current game state (waiting for next tick)
// optimisticAction
};

export function useGameEngine() {
  //   const [state, setState] = useState<GlobalState>({
  //     view: samepleGameState, // TODO: replace with inital
  //     serverValidated: {
  //       gameState: {}, // snapshot of previous
  //       actions: [], // actions between serverValidated gameState and current
  //     },
  //     pendingActions: [], // actions we have not added to current game state (waiting for next tick)
  //   });
  const onMessage = (data: string) => {
    // validated payload that server sent { a player's action }
    // could require rolling back
    // could be queued for next tick

    // data == "action:{pid}:{turnCount}:{action}"
    const [type, playerId, turnNumber, action] = data.split(":");
    globalState.serverValidated.actions.push({ playerId, turnNumber, action });

	// make view (serverValidated.gameState, serverValidated.actions) => view
	// - serverValidated.actions. filter out all the moves that will happen on the next tick
	//
	// on tick ()
	// - serverValidated.actions. filter only the moves that should happen on this tick
	//

	if beforeNextTick {
		// add it pendingActions
	} else {
		// rollback
	}


  };

  const [connected] = useWebsocket(onMessage);

  setInterval(function tick() {
	// given servervalidated game state, filter servervalidated actions for before next tick
    // process tick
  }, 1000);

  // TODO: on connect to server, initialize default game state w/ player ids

  // TODO: bind to incoming messages from webocket, writing actions
  // onto game state
  // IF we get a message that's for the prior "turn" we already
  // "ticked", go back to server validated and rerun all actions since

  // TODO: expose function to game component to be able to send moves

  // TODO: synchronized music playback

  return state;
}

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
