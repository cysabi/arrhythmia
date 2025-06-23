import { useMemo } from "react";
import { progressGame } from "./engine";
import useGameState from "./useGameState";
import useConductor from "./useConductor";
import useConnection from "./useConnection";
import useInput from "./useInput";

const useClient = () => {
  const [state, dispatch] = useGameState();

  const ws = useConnection(dispatch);

  const conductor = useConductor(state.startAt, dispatch);

  useInput(state, dispatch, ws.send, conductor.getBeat);

  const view = useMemo(() => {
    return progressGame(
      state.snapshot,
      [...state.validated, ...state.optimistic],
      state.turnCount,
    );
  }, [state]);

  return [ws, conductor, view] as const;
};
export default useClient;
