import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ActionPayload, Action, GameState } from "../types";
import {
  progressGame,
  initialState,
  ensurePlayers,
} from "../GameStateManager/game-logic";
import useWebsocket from "./useWebsocket";
import BeatManager from "../BeatManager";

interface ClientState {
  playerId: string;
  turnCount: number;
  snapshot: GameState;
  validated: ActionPayload[];
  optimistic: ActionPayload[];
  startAt: Date | null;
}

export function useClient() {
  const [state, dispatch] = useReducer(reducer, {
    playerId: "",
    turnCount: 0,
    snapshot: initialState,
    validated: [],
    optimistic: [],
    startAt: null,
  } as ClientState);

  const beatManager = useMemo(() => {
    const bm = new BeatManager();
    bm.onBeat = () => {
      dispatch({
        type: "TICK",
      });
    };
    return bm;
  }, []);

  useEffect(() => {
    beatManager.startAt(new Date(new Date().valueOf() + 10));
  }, [state.startAt]);

  const [connected, send] = useWebsocket((data) => {
    console.log(data);
    const payload = data.split(":");
    const type = payload.shift()!;

    switch (type) {
      case "you": {
        const playerId = payload.shift()!;
        const peerIds = payload
          .shift()!
          .split(",")
          .filter((pid) => pid.length > 0);

        dispatch({
          type: "RECEIVED_YOU",
          payload: { playerId, peerIds },
        });
        break;
      }
      case "them": {
        const peerId = payload.shift()!;
        dispatch({
          type: "RECEIVED_THEM",
          payload: { peerId },
        });
        break;
      }
      case "start": {
        // TODO: try to use performance instead for precision/clock sync
        const at = new Date(payload.shift()!);
        dispatch({ type: "RECEIVED_START", payload: { at } });

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
      state.turnCount,
    );
  }, [state]);

  const act = useCallback(
    (action: Action) => {
      const payload = {
        action,
        turnCount: state.turnCount,
        playerId: state.playerId,
      };
      dispatch({ type: "INPUT", payload });
      if (send) {
        send(JSON.stringify(payload));
      } else {
        console.error("Websocket not yet connected");
      }
    },
    [dispatch, send, state.playerId, state.turnCount],
  );

  // TODO: on connect to server, initialize default game state w/ player ids

  return { view, act };
}

type ClientEvent =
  | { type: "RECIEVED_ACTION"; payload: ActionPayload }
  | { type: "INPUT"; payload: ActionPayload }
  | { type: "TICK" }
  | { type: "RECEIVED_START"; payload: { at: Date } }
  | {
      type: "RECEIVED_YOU";
      payload: { playerId: string; peerIds: string[] };
    }
  | {
      type: "RECEIVED_THEM";
      payload: { peerId: string };
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
