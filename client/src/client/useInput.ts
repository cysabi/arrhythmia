import { useEffect, useRef, type ActionDispatch } from "react";
import type { ClientEvent, ClientState } from "./useGameState";
import type { Action } from "../types";

const useInput = (
  state: ClientState,
  dispatch: ActionDispatch<[client: ClientEvent]>,
  send: WebSocket["send"],
  getBeat?: () => { beat: number; offset: number }
) => {
  const actRef = useRef<(a: Action) => void | null>(null);

  actRef.current = (actionInput: Action) => {
    if (!getBeat) return; // song hasn't started yet
    const { beat, offset } = getBeat();

    console.log({ act: { beat, offset } });

    // if player has already moved for beat that theyre trying to move for
    if (
      [...state.optimistic, ...state.validated].find(
        (p) => p.turnCount === beat
      )
    ) {
      // TODO: give error feedback -- already moved!
      console.log({ act: "already moved!" });
      return;
    }

    // TODO: give error feedback -- off timing!
    const action = Math.abs(offset) > 0.2 ? "skip" : actionInput; // you are too offbeat >:(
    const payload = {
      action,
      turnCount: beat,
      playerId: state.playerId,
    };

    console.log("hang?");
    dispatch({ type: "INPUT", payload });
    console.log("hang??");
    send(["action", payload.turnCount, payload.action].join(";"));
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const act = actRef.current;
      if (!act) return console.error("Act not yet registered.");

      const key = e.key;
      switch (key) {
        case "w":
          return act("moveUp");
        case "ArrowUp":
          return act("moveUp");
        case "a":
          return act("moveLeft");
        case "ArrowLeft":
          return act("moveLeft");
        case "s":
          return act("moveDown");
        case "ArrowDown":
          return act("moveDown");
        case "d":
          return act("moveRight");
        case "ArrowRight":
          return act("moveRight");
        case " ":
          return act("shoot");
      }
    };

    document.addEventListener("keydown", handleKeydown, true);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);
};

export default useInput;
