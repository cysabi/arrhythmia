import { useEffect, type ActionDispatch } from "react";
import type { ClientEvent, ClientState } from "./useGameState";
import type { Action } from "../types";

const useInput = (
  state: ClientState,
  dispatch: ActionDispatch<[client: ClientEvent]>,
  act: (action: Action) => void,
) => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // TODO if you are outside of the timing window, do a skip for this turn

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
