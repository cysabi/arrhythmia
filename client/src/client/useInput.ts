import { useEffect, useRef, type ActionDispatch } from "react";
import type { ClientEvent, ClientState } from "./useGameState";
import type { Action, ProjectileType } from "../types";

const useInput = (
  state: ClientState,
  dispatch: ActionDispatch<[client: ClientEvent]>,
  send: WebSocket["send"],
  getBeat?: () => { beat: number; offset: number },
) => {
  const actRef = useRef<(a: Action, p?: ProjectileType) => void | null>(null);

  actRef.current = (actionInput: Action, projectileType?: ProjectileType) => {
    if (!getBeat) return; // song hasn't started yet
    const { beat, offset } = getBeat();

    // if player has already moved for beat that theyre trying to move for
    if (
      [...state.optimistic, ...state.validated].find(
        (p) => p.turnCount === beat,
      )
    ) {
      // TODO: give error feedback -- already moved!
      return console.log({ act: "already moved!" });
    }

    let action = actionInput;
    if (Math.abs(offset) > 0.225) {
      // TODO: give error feedback -- off timing!
      return console.log({ act: "you are too offbeat!" });
    }
    const payload = {
      action,
      turnCount: beat,
      playerId: state.playerId,
      projectileType,
    };

    dispatch({ type: "INPUT", payload });
    send(
      [
        "action",
        payload.turnCount,
        payload.action,
        payload.projectileType,
      ].join(";"),
    );
  };

  let heldKeys = useRef(new Set());

  useEffect(() => {
    const handleKeyup = (e: KeyboardEvent) => {
      heldKeys.current.delete(e.key.toLowerCase());
    };

    const handleKeydown = (e: KeyboardEvent) => {
      const act = actRef.current;
      if (!act) return console.error("Act not yet registered.");

      const key = e.key;
      heldKeys.current.add(key.toLowerCase());
      switch (key) {
        case "w":
        case "ArrowUp":
          return act("moveUp");
        case "a":
        case "ArrowLeft":
          return act("moveLeft");
        case "s":
        case "ArrowDown":
          return act("moveDown");
        case "d":
        case "ArrowRight":
          return act("moveRight");
        case " ":
          if (heldKeys.current.has("shift")) {
            if (heldKeys.current.has("c")) {
              return act("shoot", "cross_of_death");
            } else {
              return act("shoot", "spread");
            }
          } else if (heldKeys.current.has("x")) {
            return act("shoot", "diag_cross");
          } else {
            return act("shoot", "basic");
          }
      }
    };

    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("keyup", handleKeyup, true);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("keyup", handleKeyup);
    };
  }, []);
};

export default useInput;
