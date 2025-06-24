import { useEffect, useRef, type ActionDispatch } from "react";
import type { ClientEvent, ClientState } from "./useGameState";
import type { Action, Ability } from "../types";

const useInput = (
  state: ClientState,
  dispatch: ActionDispatch<[client: ClientEvent]>,
  send: WebSocket["send"],
  getBeat?: () => { beat: number; offset: number },
) => {
  const actRef = useRef<(a: Action, p?: Ability) => void | null>(null);

  actRef.current = (action: Action, projectileType?: Ability) => {
    if (!getBeat) return; // song hasn't started yet
    const { beat, offset } = getBeat();

    if (alreadyMoved(state, beat)) {
      return dispatch({ type: "FEEDBACK", payload: "already moved!" });
    }

    console.log(state.cooldowns);

    const payload = {
      action,
      turnCount: beat,
      playerId: state.playerId,
      projectileType,
    };
    if (isOffBeat(offset)) {
      dispatch({
        type: "FEEDBACK",
        payload: offset > 0 ? "too late!" : "too early!",
      });
      payload.action = "skip";
    } else if (
      action === "shoot" &&
      isOnCooldown(state.cooldowns, projectileType!)
    ) {
      dispatch({ type: "FEEDBACK", payload: "on cooldown!" });
      payload.action = "skip";
    }

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

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const act = actRef.current;
      if (!act) return console.error("Act not yet registered.");

      const key = e.key;
      switch (key) {
        // move
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
        // shoot
        case "1":
          return act("shoot", "basic");
        case "2":
          return act("shoot", "bomb");
        case "3":
          return act("shoot", "diag_cross");
      }
    };

    document.addEventListener("keydown", handleKeydown, true);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);
};

const alreadyMoved = (state: ClientState, beat: number) =>
  [...state.optimistic, ...state.validated].find((p) => p.turnCount === beat);

const isOffBeat = (offset: number) => Math.abs(offset) > 0.225;

const isOnCooldown = (
  cooldowns: ClientState["cooldowns"],
  projectileType: Ability,
) => projectileType && cooldowns[projectileType] > 0;

export default useInput;
