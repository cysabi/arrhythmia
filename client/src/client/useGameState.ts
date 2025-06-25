import { useReducer } from "react";
import type { ActionPayload, GameState } from "../types";
import { progressGame, initGame } from "./engine";

const initialState = {
  playerId: "",
  feedback: "",
  turnCount: 0,
  snapshot: initGame(),
  validated: [],
  optimistic: [],
  cooldowns: {
    basic: 1,
    bomb: 2,
    diag_cross: 3,
  },
  startAt: null,
};

const useGameState = () => {
  return useReducer(reducer, {
    ...initialState,
  } as ClientState);
};

const reducer = (state: ClientState, event: ClientEvent): ClientState => {
  switch (event.type) {
    case "RECEIVED_START": {
      const { playerId, peerIds, startAt } = event.payload;
      return {
        ...initialState,
        playerId,
        snapshot: initGame({ playerId, peerIds: peerIds.slice(-3) }), // FIXME: .slice stupid hack
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
      console.log("input", state.cooldowns);
      let ability = event.payload.projectileType;
      let cooldowns = { ...state.cooldowns };
      if (ability) {
        cooldowns[ability] =
          initialState.cooldowns[ability] +
          (event.payload.turnCount - state.turnCount) +
          1;
      }

      const optimistic = [...state.optimistic, event.payload];
      console.log("input", cooldowns);
      return { ...state, optimistic, cooldowns };
    }

    case "FEEDBACK": {
      return { ...state, feedback: event.payload };
    }

    case "TICK": {
      console.log("tick", state.cooldowns);
      const cooldowns = updateCooldowns(state);
      console.log("tick", cooldowns);
      return { ...state, turnCount: state.turnCount + 1, cooldowns };
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

const updateCooldowns = (state: ClientState) => {
  return (
    Object.keys(state.cooldowns) as [keyof ClientState["cooldowns"]]
  ).reduce(
    (res, key) => {
      if (state.cooldowns[key] > 0) {
        res[key] = state.cooldowns[key] - 1;
      } else {
        res[key] = 0;
      }
      return res;
    },
    {} as ClientState["cooldowns"]
  );
};

export interface ClientState {
  playerId: string;
  turnCount: number;
  feedback: string;
  snapshot: GameState;
  validated: ActionPayload[];
  optimistic: ActionPayload[];
  startAt: number | null;
  cooldowns: { basic: number; bomb: number; diag_cross: number };
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
