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
  lobbies: [],
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
      let ability = event.payload.projectileType;
      let cooldowns = { ...state.cooldowns };

      if (ability) {
        const isCoolingDown =
          cooldowns[ability] !== 0 &&
          cooldowns[ability] < initialState.cooldowns[ability];

        if (!isCoolingDown) {
          cooldowns[ability] =
            initialState.cooldowns[ability] +
            (event.payload.turnCount - state.turnCount) +
            1;
        }
      }

      const optimistic = [...state.optimistic, event.payload];
      return { ...state, optimistic, cooldowns };
    }

    case "FEEDBACK": {
      return { ...state, feedback: event.payload };
    }

    case "TICK": {
      const cooldowns = updateCooldowns(state);
      return { ...state, turnCount: state.turnCount + 1, cooldowns };
    }

    case "YOU": {
      const playerId = event.payload;
      return { ...state, playerId };
    }

    case "RECEIVED_LOBBIES": {
      const { lobbies } = event.payload;

      return { ...state, lobbies };
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
  lobbies: {
    id: string;
    playerIds: string[];
  }[];
}

export type ClientEvent =
  | { type: "RECEIVED_ACTION"; payload: ActionPayload }
  | { type: "INPUT"; payload: ActionPayload }
  | { type: "FEEDBACK"; payload: string }
  | { type: "TICK" }
  | { type: "YOU"; payload: string }
  | {
      type: "RECEIVED_START";
      payload: { playerId: string; peerIds: string[]; startAt: number };
    }
  | {
      type: "RECEIVED_LOBBIES";
      payload: {
        lobbies: {
          id: string;
          playerIds: string[];
        }[];
      };
    };

export default useGameState;
