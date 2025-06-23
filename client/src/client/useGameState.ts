import { useReducer } from "react";
import type { ActionPayload, GameState } from "../types";
import { progressGame, initGame } from "./engine";

const useGameState = () => {
  return useReducer(reducer, {
    playerId: "",
    feedback: "",
    turnCount: 0,
    snapshot: initGame(),
    validated: [],
    optimistic: [],
    startAt: null,
  } as ClientState);
};

const reducer = (state: ClientState, event: ClientEvent): ClientState => {
  switch (event.type) {
    case "RECEIVED_START": {
      const { playerId, peerIds, startAt } = event.payload;
      return {
        ...state,
        playerId,
        snapshot: initGame({ playerId, peerIds }),
        startAt,
      };
    }

    case "RECEIVED_ACTION": {
      let s = structuredClone(state);

      s = updateSnapshot(s, event.payload);
      s = updateValidated(s, event.payload);

      return s;
    }

    case "INPUT": {
      const optimistic = [...state.optimistic, event.payload];
      return { ...state, optimistic };
    }

    case "FEEDBACK": {
      return { ...state, feedback: event.payload };
    }

    case "TICK": {
      return { ...state, turnCount: state.turnCount + 1 };
    }
  }
};

const updateSnapshot = (state: ClientState, payload: ActionPayload) => {
  const snapshotTurnCount =
    state.validated.at(-1)?.turnCount ?? payload.turnCount;
  if (payload.turnCount > snapshotTurnCount + 1) {
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

export interface ClientState {
  playerId: string;
  turnCount: number;
  feedback: string;
  snapshot: GameState;
  validated: ActionPayload[];
  optimistic: ActionPayload[];
  startAt: number | null;
}

export type ClientEvent =
  | { type: "RECEIVED_ACTION"; payload: ActionPayload }
  | { type: "INPUT"; payload: ActionPayload }
  | { type: "FEEDBACK"; payload: string }
  | { type: "TICK" }
  | {
      type: "RECEIVED_START";
      payload: { playerId: string; peerIds: string[]; startAt: number };
    };

export default useGameState;
