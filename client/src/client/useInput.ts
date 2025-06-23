import { useEffect, useRef, type ActionDispatch } from "react";
import type { ClientEvent, ClientState } from "./useGameState";
import type { Action, ProjectileType } from "../types";

const useInput = (
  state: ClientState,
  dispatch: ActionDispatch<[client: ClientEvent]>,
  send: WebSocket["send"],
  getBeat?: () => { beat: number; offset: number }
) => {
  const actRef = useRef<(a: Action, p?: ProjectileType) => void | null>(null);

  actRef.current = (action: Action, projectileType?: ProjectileType) => {
    if (!getBeat) return; // song hasn't started yet
    const { beat, offset } = getBeat();

    // if player has already moved for beat that theyre trying to move for
    if (
      [...state.optimistic, ...state.validated].find(
        (p) => p.turnCount === beat
      )
    ) {
      return dispatch({ type: "FEEDBACK", payload: "already moved!" });
    }

    const payload = {
      action,
      turnCount: beat,
      playerId: state.playerId,
      projectileType,
    };
    if (Math.abs(offset) > 0.225) {
      payload.action = "skip";
      console.log({ offset });
      dispatch({
        type: "FEEDBACK",
        payload: offset > 0 ? "too late!" : "too early!",
      });
    } else {
      dispatch({ type: "FEEDBACK", payload: "" });
    }

    dispatch({ type: "INPUT", payload });
    send(
      [
        "action",
        payload.turnCount,
        payload.action,
        payload.projectileType,
      ].join(";")
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
            return act("shoot", "spread");
          } else if (heldKeys.current.has("x")) {
            return act("shoot", "diag_cross");
          } else if (heldKeys.current.has("b")) {
            return act("shoot", "bomb");
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
