import { useMemo } from "react";
import { progressGame } from "./engine";
import useGameState from "./useGameState";
import useConductor from "./useConductor";
import useConnection from "./useConnection";
import useInput from "./useInput";

// TODO: add functionality to trigger game start:
// - UI: Overlay + Button?
// - Send message to server, ensure server broadcasts start timestamp
// - Verify start payload handling in client works (starts conductor)

const useClient = () => {
  // FIXME: Showing other player moves is lagging by at least 1 turn
  // FIXME: Projectiles are not appearing from other players!
  // FIXME: Projectiles are not moving every turn incmrement (they should move even if all players do not)
  const [state, dispatch] = useGameState();

  console.log("rerender!!");

  const ws = useConnection(dispatch);

  const conductor = useConductor(state.startAt, dispatch);

  useInput(state, dispatch, ws.send, conductor.getBeat);

  const view = useMemo(() => {
    return progressGame(
      state.snapshot,
      [...state.validated, ...state.optimistic],
      state.turnCount
    );
  }, [state]);

  return [ws, conductor, view] as const;
};
export default useClient;
