import { useCallback, useMemo } from "react";
import { progressGame } from "./engine";
import useGameState from "./useGameState";
import type { Action } from "../types";
import useConductor from "./useConductor";
import useConnection from "./useConnection";
import useInput from "./useInput";

const useClient = () => {
  const [state, dispatch] = useGameState();

  const [connected, send] = useConnection(state, dispatch);

  const act = useCallback(
    (action: Action) => {
      // TODO if you already acted this turn, return early

      const payload = {
        action,
        turnCount: state.turnCount,
        playerId: state.playerId,
      };
      dispatch({ type: "INPUT", payload });
      send!(["action", payload.turnCount, payload.action].join(":"));
    },
    [dispatch, send, state.turnCount, state.playerId]
  );

  useConductor(state, dispatch, act);
  useInput(state, dispatch, act);

  const view = useMemo(() => {
    return progressGame(
      state.snapshot,
      [...state.validated, ...state.optimistic],
      state.turnCount
    );
  }, [state]);

  return view;
};
export default useClient;
