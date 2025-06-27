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

  const status = useStatus(ws, state, conductor);

  useInput(state, dispatch, ws.send, conductor.getBeat);

  const view = useMemo(() => {
    return progressGame(
      state.snapshot,
      [...state.validated, ...state.optimistic],
      state.turnCount
    );
  }, [state]);

  return { send: ws.send, view, status } as const;
};

const useStatus = (
  ws: ReturnType<typeof useConnection>,
  state: ReturnType<typeof useGameState>[0],
  conductor: ReturnType<typeof useConductor>
) => {
  const status = useMemo(() => {
    if (!ws.connected || !state.playerId || !state.lobbies) {
      return { state: "connecting" } as const;
    }
    if (conductor.status === "idle") {
      return {
        state: "lobbies",
        playerId: state.playerId,
        lobbies: state.lobbies,
      } as const;
    }
    if (conductor.status === "scheduled") {
      return {
        state: "starting",
        playerId: state.playerId,
        lobbies: state.lobbies,
      } as const;
    }
    if (conductor.status === "playing") {
      return {
        state: "play",
        playerId: state.playerId,
        tooltip: state.feedback,
        cooldowns: state.cooldowns,
        barProps: conductor.barProps,
        getBeat: conductor.getBeat,
      } as const;
    }
    return { state: "error" } as const;
  }, [ws.connected, state.playerId, state.lobbies, state.cooldowns, conductor]);

  return status;
};

export default useClient;
