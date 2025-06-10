import { useCallback, useMemo } from "react";
import { progressGame } from "./engine";
import useGameState from "./useGameState";
import type { Action } from "../types";
import useConductor from "./useConductor";
import useConnection from "./useConnection";
import useInput from "./useInput";

// TODO: add functionality to trigger game start:
// - UI: Overlay + Button?
// - Send message to server, ensure server broadcasts start timestamp
// - Verify start payload handling in client works (starts conductor)

const useClient = () => {
  const [state, dispatch] = useGameState();

  const [connected, send] = useConnection(state, dispatch);

  const beatManager = useConductor(state, dispatch);

  // TODO: timing windows
  // TODO: act() a skip immediately after rhythm timing window passes
  const act = useCallback(
    (action: Action) => {
      if (
        state.optimistic.findLastIndex((v) => v.turnCount == state.turnCount) !=
        -1
      ) {
        const payload = {
          action,
          turnCount: state.turnCount,
          playerId: state.playerId,
        };

        dispatch({ type: "INPUT", payload });
        send!(["action", payload.turnCount, payload.action].join(":"));
      }
    },
    [dispatch, send, state.turnCount, state.playerId],
  );

  useInput(state, dispatch, act);

  const view = useMemo(() => {
    return progressGame(
      state.snapshot,
      [...state.validated, ...state.optimistic],
      state.turnCount,
    );
  }, [state]);

  return view;
};
export default useClient;
