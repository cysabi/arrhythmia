import { useRef, useEffect, type ActionDispatch, useCallback } from "react";
import type { ClientEvent } from "./useGameState";
import * as Tone from "tone";
import type { TransportClass } from "tone/build/esm/core/clock/Transport";

const track1 = {
  bpm: 152,
  offset: 0.5,
  volume: -10,
  song: "/song.wav",
  loopPoints: ["3m", "109m"] as const,
};

const useConductor = (
  startAt: number | null,
  dispatch: ActionDispatch<[client: ClientEvent]>
) => {
  const transport = useTransport(startAt, dispatch);

  const getBeat = useCallback(() => {
    const spb = 60 / transport.current!.bpm.value;
    const beatFloat = transport.current.seconds / spb - track1.offset;

    const beat = Math.round(beatFloat);
    const offset = beatFloat - beat;

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
    players.current = new Tone.Players({
      song: track1.song,
      clap: "/clap.wav",
    }).toDestination();

  useEffect(() => {
    if (!startAt) return;
    transport.current.seconds = 0;

    // clap
    transport.current.scheduleRepeat((time) => {
      players.current.player("clap").start(time);
      dispatch({ type: "TICK" });
    }, "4n");

    // song
    transport.current.schedule((time) => {
      players.current.player("song").loop = true;
      players.current.player("song").volume.value = track1.volume;
      players.current.player("song").setLoopPoints(...track1.loopPoints);
      players.current.player("song").start(time, 0);
    }, `+${track1.offset}n`);

    console.log({ startAt });
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
