import { useCallback, useMemo, useReducer, useRef } from "react";
import type { ActionPayload, Action, GameState } from "../types";
import {
  progressGame,
  initialState,
  addPlayer,
} from "../GameStateManager/game-logic";
import useWebsocket from "./useWebsocket";
import BeatManager from "../BeatManager";

interface ClientState {
  playerId: string;
  turnCount: number;
  snapshot: GameState;
  validated: ActionPayload[];
  optimistic: ActionPayload[];
}

export function useClient() {
  const [state, dispatch] = useReducer(reducer, {
    playerId: "",
    turnCount: 0,
    snapshot: initialState,
    validated: [],
    optimistic: [],
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

  const [connected, send] = useWebsocket((data) => {
    const payload = data.split(":");
    const type = payload.shift()!;

    switch (type) {
      // TODO: game init multiplier: problems
      //   - need to find out ids of other player(s)
      //   - need to assign reasonable starting position to other players and self
      // One idea:
      //   have the server know about possible start positions
      //   return a start position with the start payload
      //   respond to start payload with a payload containing own entity
      //     (id + position) for broadcast to other members
      case "start": {
        const playerId = payload.shift()!;
        dispatch({
          type: "RECIEVED_START",
          payload: { playerId },
        });

        // TODO: pull a timestamp off of start event
        beatManager.startAt(new Date(new Date().valueOf() + 10));
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
  | { type: "RECIEVED_START"; payload: { playerId: string } }
  | { type: "RECIEVED_ACTION"; payload: ActionPayload }
  | { type: "INPUT"; payload: ActionPayload }
  | { type: "TICK" };
const reducer = (state: ClientState, event: ClientEvent): ClientState => {
  switch (event.type) {
    case "RECIEVED_START": {
      const playerId = event.payload.playerId;
      return {
        ...state,
        playerId,
        snapshot: addPlayer(state.snapshot, { id: playerId, position: [2, 2] }),
      };
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
