import type { GameState } from "../types";
import type { ActionPayload } from "../types";

import { progressGame, sampleGameState } from "../GameStateManager/game-logic";
import useWebsocket from "./useWebsocket";
import { useReducer } from "react";

class ClientState {
  playerId: string = "";
  view: GameState = sampleGameState;
  snapshot: GameState = sampleGameState;
  validated: ActionPayload[] = [];
  optimistic: ActionPayload[] = [];

  onInput = (payload: ActionPayload) => {
    this.optimistic.push(payload);
    this.updateView();
  };

  onRecieve = (payload: ActionPayload) => {
    // update snapshot
    const snapshotTurnCount =
      this.validated.at(-1)?.turnCount ?? payload.turnCount;
    if (payload.turnCount > snapshotTurnCount) {
      this.snapshot = progressGame(this.snapshot, this.validated);
      this.validated = [];
    }

    // update validated
    this.validated.push(payload);
    if (payload.playerId === this.playerId) {
      let old = this.optimistic.shift()!;
      if (old.action === payload.action) {
        return;
      }
    }
    this.updateView();
  };

  onTick = () => {
    // need to apply tick to progressGame even when no tick
    progressGame(this.snapshot, []);
  };

  updateView = () => {
    // does this handle? ignoring future moves? queuing moves?
    this.view = progressGame(this.snapshot, [
      ...this.validated,
      ...this.optimistic,
    ]);
  };
}

interface ClientState {
  playerId: string;
  view: GameState;
  snapshot: GameState;
  validated: ActionPayload[];
  optimistic: ActionPayload[];
}

type ClientAction =
  | { type: "INPUT"; payload: ActionPayload }
  | { type: "RECEIVE"; payload: ActionPayload }
  | { type: "TICK" };

const initialState: ClientState = {
  playerId: "",
  view: sampleGameState,
  snapshot: sampleGameState,
  validated: [],
  optimistic: [],
};

function clientReducer(state: ClientState, action: ClientAction): ClientState {
  switch (action.type) {
    case "INPUT": {
      const optimistic = [...state.optimistic, action.payload];
      return { ...state, optimistic };
    }

    case "RECEIVE": {
      const s = structuredClone(state);

      // update snapshot
      const snapshotTurnCount =
        s.validated.at(-1)?.turnCount ?? action.payload.turnCount;
      if (action.payload.turnCount > snapshotTurnCount) {
        s.snapshot = progressGame(s.snapshot, s.validated);
        s.validated = [];
      }

      // update validated
      s.validated.push(action.payload);
      if (action.payload.playerId === s.playerId) {
        const old = s.optimistic.shift()!;
        if (old.action === action.payload.action) {
          return s;
        }
      }

      s.view = progressGame(s.snapshot, [...s.validated, ...s.optimistic]);
      return s;
    }

    case "TICK": {
      // Progress game even with no actions
      progressGame(state.snapshot, []);
      return state;
    }

    default:
      return state;
  }
}

export function useClient() {
  //   const [state, setState] = useState<GlobalState>({
  //     view: samepleGameState, // TODO: replace with inital
  //     serverValidated: {
  //       gameState: {}, // snapshot of previous
  //       actions: [], // actions between serverValidated gameState and current
  //     },
  //     pendingActions: [], // actions we have not added to current game state (waiting for next tick)
  //   });
  // on recieve (actionpayload) <- server validated
  //    -
  //
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
  // on keydown (actionpayload):
  // if early : ActionsQueue += action
  // 	 if late  : progressGame(action)

  // if beforeNextTick {
  // 	// add it pendingActions
  // } else {
  // 	// rollback
  // }

  const [connected] = useWebsocket(onMessage);

  // TODO: on connect to server, initialize default game state w/ player ids

  // TODO: bind to incoming messages from webocket, writing actions
  // onto game state
  // IF we get a message that's for the prior "turn" we already
  // "ticked", go back to server validated and rerun all actions since

  // TODO: expose function to game component to be able to send moves

  // TODO: synchronized music playback

  return state;
}
