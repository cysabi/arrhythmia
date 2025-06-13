import { useReducer } from "react";
import type { ActionPayload, GameState } from "../types";
import { progressGame, initialState, ensurePlayers } from "./engine";

const useGameState = () => {
  return useReducer(reducer, {
    playerId: "",
    turnCount: 0,
    snapshot: initialState,
    validated: [],
    optimistic: [],
    startAt: null,
  } as ClientState);
};

const reducer = (state: ClientState, event: ClientEvent): ClientState => {
  switch (event.type) {
    case "RECEIVED_YOU": {
      const { playerId, peerIds } = event.payload;
      return {
        ...state,
        playerId,
        snapshot: ensurePlayers(state.snapshot, {
          playerIds: [playerId, ...peerIds],
        }),
      };
    }

    case "RECEIVED_THEM": {
      const { peerId } = event.payload;
      return {
        ...state,
        snapshot: ensurePlayers(state.snapshot, { playerIds: [peerId] }),
      };
    }

    case "RECEIVED_START":
      const { at } = event.payload;
      return {
        ...state,
        startAt: at,
      };

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
      snapshotTurnCount,
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
  snapshot: GameState;
  validated: ActionPayload[];
  optimistic: ActionPayload[];
  startAt: number | null;
}

export type ClientEvent =
  | { type: "RECIEVED_ACTION"; payload: ActionPayload }
  | { type: "INPUT"; payload: ActionPayload }
  | { type: "TICK" }
  | { type: "RECEIVED_START"; payload: { at: number } }
  | {
      type: "RECEIVED_YOU";
      payload: { playerId: string; peerIds: string[] };
    }
  | {
      type: "RECEIVED_THEM";
      payload: { peerId: string };
    };

export default useGameState;
