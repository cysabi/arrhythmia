import { useMemo, useReducer } from "react";
import type { ActionPayload, Action, GameState } from "../types";
import { progressGame, sampleGameState } from "../GameStateManager/game-logic";
import useWebsocket from "./useWebsocket";

interface ClientState {
  playerId: string;
  turnCount: number;
  view: GameState;
  snapshot: GameState;
  validated: ActionPayload[];
  optimistic: ActionPayload[];
}

export function useClient() {
  const [state, dispatch] = useReducer(reducer, {
    playerId: "",
    turnCount: 0,
    view: sampleGameState,
    snapshot: sampleGameState,
    validated: [],
    optimistic: [],
  } as ClientState);

  const [connected, send] = useWebsocket((data) => {
    const payload = data.split(":");
    const type = payload.shift()!;

    switch (type) {
      case "start": {
        const playerId = payload.shift()!;
        dispatch({
          type: "RECIEVED_START",
          payload: { playerId },
        });
        break;
      }

      case "action": {
        const playerId = payload.shift()!;
        const turnCount = parseInt(payload.shift()!);
        const action = payload.shift()! as Action;
        dispatch({
          type: "RECIEVED_ACTION",
          payload: { playerId, turnCount, action },
        });
        break;
      }
    }
  });

  const view = useMemo(() => {
    return progressGame(
      state.snapshot,
      [...state.validated, ...state.optimistic],
      state.turnCount
    );
  }, [state]);

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

type ClientEvent =
  | { type: "RECIEVED_START"; payload: { playerId: string } }
  | { type: "RECIEVED_ACTION"; payload: ActionPayload }
  | { type: "INPUT"; payload: ActionPayload }
  | { type: "TICK" };
const reducer = (state: ClientState, event: ClientEvent): ClientState => {
  switch (event.type) {
    case "RECIEVED_START": {
      const playerId = event.payload.playerId;
      return { ...state, playerId };
    }

    case "RECIEVED_ACTION": {
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
      const turnCount = state.turnCount + 1;
      return { ...state, turnCount };
    }
  }
};

const updateSnapshot = (state: ClientState, payload: ActionPayload) => {
  const snapshotTurnCount =
    state.validated.at(-1)?.turnCount ?? payload.turnCount;
  if (payload.turnCount > snapshotTurnCount) {
    state.snapshot = progressGame(
      state.snapshot,
      state.validated,
      snapshotTurnCount
    );
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
