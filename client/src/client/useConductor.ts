import { useEffect, useMemo, type ActionDispatch } from "react";
import type { ClientEvent, ClientState } from "./useGameState";
import type { Action } from "../types";

const useConductor = (
  state: ClientState,
  dispatch: ActionDispatch<[client: ClientEvent]>,
  act: (action: Action) => void
) => {
  const beatManager = useMemo(() => {
    const beatManager = new BeatManager();
    beatManager.onBeat = () => {
      dispatch({
        type: "TICK",
      });
    };
    return beatManager;
  }, []);

  useEffect(() => {
    beatManager.startAt(new Date(new Date().valueOf() + 10));
  }, [state.startAt]);

  // TODO act() a skip immediately after rhythm timing window passes

  return beatManager;
};

export class BeatManager {
  interval: number | null;
  beatMs: number;

  beatCallback = () => {};

  constructor() {
    this.interval = null;
    this.beatMs = 2000;
  }

  startAt(at: Date) {
    setTimeout(() => {
      // TODO: start music playback here!
      this.interval = setInterval(() => {
        this.beatCallback && this.beatCallback();
      }, this.beatMs);
    }, at.getMilliseconds() - new Date().getMilliseconds());
  }

  stop() {
    // TODO: stop music playback here!
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  onBeat(cb: () => void) {
    this.beatCallback = cb;
  }
}

export default useConductor;
