import { useEffect, type ActionDispatch } from "react";
import type { ClientEvent, ClientState } from "./useGameState";
import type { Action } from "../types";

const useInput = (
  state: ClientState,
  dispatch: ActionDispatch<[client: ClientEvent]>,
  getBeat: () => { beat: number; offset: number },
  send: WebSocket["send"],
) => {
  const act = (actionInput: Action) => {
    const { beat, offset } = getBeat();
    console.log(beat, offset);

    console.log({ opt: state.optimistic });
    if (state.optimistic.find((p) => p.turnCount === beat)) {
      return; // already sent a move this beat
    }

    const action = Math.abs(offset) > 0.25 ? "skip" : actionInput; // you are too offbeat >:(
    const payload = {
      action,
      turnCount: state.turnCount,
      playerId: state.playerId,
    };

    dispatch({ type: "INPUT", payload });
    send(["action", payload.turnCount, payload.action].join(":"));
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const key = e.key;
      switch (key) {
        case "w":
          return act("moveUp");
        case "a":
          return act("moveLeft");
        case "s":
          return act("moveDown");
        case "d":
          return act("moveRight");
        case " ":
          return act("shoot");
      }
    };

    document.addEventListener("keydown", handleKeydown, true);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });
};

export default useInput;
