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
import { useState } from "react";
import { sampleGameState } from "../GameStateManager/game-logic";

type GlobalState = {
	displayedState: GameState;
	serverValidated: {
		gameState: GameState;
		actions: ActionPayload[];
	};
	pendingActions: ActionPayload[];
};

export function useGameEngine() {
	const [state, setState] = useState<GlobalState>({
		view: samepleGameState, // TODO: replace with inital
		serverValidated: {
			gameState: {}, // snapshot of previous
			actions: [], // actions between serverValidated gameState and current
		},
		pendingActions: [], // actions we have not added to current game state (waiting for next tick)
	});

	setInterval(function () {
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
	selfTurn: ClientTurn,
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
	turn: ActionPayload,
): TurnsSinceSnapshot => {};

const rollback = (snpashot: Entities, turns: TurnsSinceSnapshot): Entities => {
	applyMove;
};

declare function maybeSnapshot(
	game: Entities,
	turns: TurnsSinceSnapshot,
): Entities;
