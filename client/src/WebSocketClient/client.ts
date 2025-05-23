import type { Action, GameState } from "../types";
import type { ActionPayload } from "../types";

import { progressGame, sampleGameState } from "../GameStateManager/game-logic";
import useWebsocket from "./useWebsocket";
import { useMemo, useReducer } from "react";

class Temp {
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
  };
}

const updateSnapshot = (state: ClientState, payload: ActionPayload) => {
  const snapshotTurnCount =
    state.validated.at(-1)?.turnCount ?? payload.turnCount;
  if (payload.turnCount > snapshotTurnCount) {
    state.snapshot = progressGame(state.snapshot, state.validated);
    state.validated = [];
  }

  return state;
};

const updateValidated = (state: ClientState, payload: ActionPayload) => {
  state.validated.push(payload);
  if (payload.playerId === state.playerId) {
    state.optimistic.shift()!; // const old = state.optimistic.shift()!;
    // if (old.action === payload.action) {
    //   return state; // can we use this somehow?
    // }
  }

  return state;
};

interface ClientState {
  playerId: string;
  view: GameState;
  snapshot: GameState;
  validated: ActionPayload[];
  optimistic: ActionPayload[];
}

type ClientEvent =
  | { type: "START"; playerId: string }
  | { type: "ACTION"; payload: ActionPayload }
  | { type: "INPUT"; payload: ActionPayload }
  | { type: "TICK" };

function clientReducer(state: ClientState, event: ClientEvent): ClientState {
  switch (event.type) {
    case "START": {
      return { ...state, playerId: event.playerId };
    }
    case "ACTION": {
      let s = structuredClone(state);

      s = updateSnapshot(s, event.payload);
      s = updateValidated(s, event.payload);

      return s;
    }

    case "INPUT": {
      const optimistic = [...state.optimistic, event.payload];
      return { ...state, optimistic };
    }

    case "TICK": {
      // how do i pass along the tick?
      // progressGame(state.snapshot);
      return state;
    }
  }
}

const initialState: ClientState = {
  playerId: "",
  view: sampleGameState,
  snapshot: sampleGameState,
  validated: [],
  optimistic: [],
};
export function useClient() {
  const [state, dispatch] = useReducer(clientReducer, initialState);

  // make view (serverValidated.gameState, serverValidated.actions) => view
  // - serverValidated.actions. filter out all the moves that will happen on the next tick
  const view = useMemo(() => {
    // does this handle ignoring future moves? queuing moves?
    return {
      ...state,
      view: progressGame(state.snapshot, [
        ...state.validated,
        ...state.optimistic,
      ]),
    };
  }, [state]);

  const [connected] = useWebsocket((data) => {
    const [type, playerId, turnCount, action] = data.split(":");

    switch (type) {
      case "start": {
        dispatch({
          type: "START",
          playerId,
        });
        break;
      }

      case "action": {
        dispatch({
          type: "ACTION",
          payload: {
            playerId,
            turnCount: parseInt(turnCount),
            action: action as Action,
          },
        });
        break;
      }
    }
  });

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

  // TODO: on connect to server, initialize default game state w/ player ids

  // TODO: bind to incoming messages from webocket, writing actions
  // onto game state
  // IF we get a message that's for the prior "turn" we already
  // "ticked", go back to server validated and rerun all actions since

  // TODO: expose function to game component to be able to send moves

  // TODO: synchronized music playback

  return view;
}
