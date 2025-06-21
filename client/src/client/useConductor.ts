import { useRef, useEffect, type ActionDispatch, useCallback } from "react";
import type { ClientEvent } from "./useGameState";
import * as Tone from "tone";
import song from "../sounds/song.wav";
import clap from "../sounds/clap.wav";
import type { TransportClass } from "tone/build/esm/core/clock/Transport";

const track1 = {
  bpm: 151,
};

const useConductor = (
  startAt: number | null,
  dispatch: ActionDispatch<[client: ClientEvent]>
) => {
  const transport = useTransport(startAt, dispatch);

  const getBeat = useCallback(() => {
    const msPerBeat = (60 * 1000) / transport.current!.bpm.value;
    const beatFloat = (now() - startAt!) / msPerBeat;

    console.log({ beatFloat });

    const beat = Math.round(beatFloat);
    const offset = beatFloat - beat; // the offBy unit is in beats!!

    return { beat, offset };
  }, [startAt]);

  if (startAt) {
    if (transport.current.state === "started") {
      return { status: "playing", getBeat } as const;
    }
    return { status: "scheduled" } as const;
  }
  return { status: "idle" } as const;
};

const useTransport = (
  startAt: number | null,
  dispatch: ActionDispatch<[client: ClientEvent]>
) => {
  const transport = useRef<TransportClass>(null as any);
  const players = useRef<Tone.Players>(null as any);
  if (transport.current === null) {
    transport.current = Tone.getTransport();
    transport.current.bpm.value = track1.bpm;
  }
  if (players.current === null)
    players.current = new Tone.Players({ clap, song }).toDestination();

  useEffect(() => {
    if (!startAt) return;
    transport.current.seconds = 0;

    // song
    transport.current.schedule((time) => {
      players.current.player("song").start(time);
    }, 0);

    // clap
    transport.current.scheduleRepeat((time) => {
      players.current.player("clap").start(time);
      dispatch({ type: "TICK" });
    }, "4n");

    console.log({ startAt, now: now() });

    transport.current.start(`+${(startAt - now()) / 1000}`);

    return function cleanup() {
      if (transport.current.state === "started") {
        transport.current.stop();
      }
    };
  }, [startAt]);

  return transport;
};

const now = () => performance.timeOrigin + performance.now();

export default useConductor;
