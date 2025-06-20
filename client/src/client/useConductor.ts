import { useCallback, useEffect, useMemo, type ActionDispatch } from "react";
import type { ClientEvent, ClientState } from "./useGameState";

import clap from "../sounds/clap.wav";

const useConductor = (
  state: ClientState,
  dispatch: ActionDispatch<[client: ClientEvent]>
) => {
  // cache fn that takes stuff from beatmanager to figure out beat + offset
  // beat, ms, audio content, beat

  const beatManager = useMemo(() => {
    const beatManager = new BeatManager();
    beatManager.onBeat(() => {
      dispatch({
        type: "TICK",
      });
    });
    beatManager
      .loadAudio()
      .then(() => console.log({ beatManager: "Loaded song buffer." }));
    return beatManager;
  }, []);

  useEffect(() => {
    if (!state.startAt) {
      return;
    }
    const timeout = beatManager.startAt(new Date(state.startAt)); // sync start of game for everyone

    return () => {
      clearTimeout(timeout);
      beatManager.stop();
    };
  }, [state.startAt]);

  const getBeat = useCallback(() => {
    if (state.startAt === null) {
      return { beat: null, offset: null };
    }
    const beatFloat =
      (new Date().valueOf() - state.startAt) / beatManager.msPerBeat;
    const beat = Math.round(beatFloat);
    const offset = beatFloat - beat; // the offBy unit is in beats!!

    return { beat, offset };
  }, [state.startAt, beatManager]);

  return getBeat;
};

export class BeatManager {
  interval: number | null;
  msPerBeat: number;
  audioContext: AudioContext;
  beatBuffer: AudioBuffer | null;

  beatCallback = () => {};

  constructor() {
    this.interval = null;
    this.msPerBeat = 2000;
    this.audioContext = new AudioContext();
    this.beatBuffer = null;
  }

  async loadAudio() {
    const result = await fetch(clap);
    const arrayBuffer = await result.arrayBuffer();
    this.beatBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  startAt(at: Date) {
    return setTimeout(() => {
      // TODO: start music playback here!
      this.interval = setInterval(() => {
        console.log("beat");
        this.beat();
      }, this.msPerBeat);
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
      source.buffer = this.beatBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } else {
      console.warn({ beatManager: "Beat buffer not initialized" });
    }

    this.beatCallback && this.beatCallback();
  }
}

export default useConductor;
