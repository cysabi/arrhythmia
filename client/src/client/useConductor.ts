import { useEffect, useMemo, type ActionDispatch } from "react";
import type { ClientEvent, ClientState } from "./useGameState";
import type { Action } from "../types";

import clap from "../sounds/clap.wav";

const useConductor = (
  state: ClientState,
  dispatch: ActionDispatch<[client: ClientEvent]>,
  act: (action: Action) => void,
) => {
  const beatManager = useMemo(() => {
    const beatManager = new BeatManager();
    beatManager.onBeat = () => {
      dispatch({
        type: "TICK",
      });
    };
    beatManager.loadAudio().then(() => console.log("Loaded song buffer."));
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
  audioContext: AudioContext;
  beatBuffer: AudioBuffer | null;

  beatCallback = () => {};

  constructor() {
    this.interval = null;
    this.beatMs = 2000;
    this.audioContext = new AudioContext();
    this.beatBuffer = null;
  }

  async loadAudio() {
    const result = await fetch(clap);
    const arrayBuffer = await result.arrayBuffer();
    this.beatBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  startAt(at: Date) {
    setTimeout(() => {
      console.log("setting interval");
      // TODO: start music playback here!
      this.interval = setInterval(() => {
        this.beat();
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

  private beat() {
    const source = this.audioContext.createBufferSource();

    if (this.beatBuffer) {
      console.log("playing sound");
      source.buffer = this.beatBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } else {
      console.warn("Beat buffer not initialized");
    }

    this.beatCallback && this.beatCallback();
  }
}

export default useConductor;
