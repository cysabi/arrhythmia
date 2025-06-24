import {
  useRef,
  useEffect,
  type ActionDispatch,
  useCallback,
  useState,
} from 'react';
import type { ClientEvent } from './useGameState';
import * as Tone from 'tone';
import { TransportClass } from 'tone/build/esm/core/clock/Transport';
import { DrawClass } from 'tone/build/esm/core/util/Draw';

const track1 = {
  bpm: 152,
  offset: 0.5,
  volume: -20,
  song: '/song.wav',
  loopPoints: ['3m', '109m'] as const,
};

const useConductor = (
  startAt: number | null,
  dispatch: ActionDispatch<[client: ClientEvent]>
) => {
  const [barProps, setBarProps] = useState({ time: 0, bpm: 0 });
  const transport = useTransport(startAt, dispatch, setBarProps);

  const getBeat = useCallback(() => {
    const spb = 60 / transport.current!.bpm.value;
    const beatFloat = transport.current.seconds / spb - track1.offset;

    const beat = Math.round(beatFloat);
    const offset = beatFloat - beat;

    return { beat, offset };
  }, [startAt]);

  if (startAt) {
    if (transport.current.state === 'started') {
      return { status: 'playing', getBeat, barProps } as const;
    }
    return { status: 'scheduled', barProps } as const;
  }
  return { status: 'idle', barProps } as const;
};

export const useTransport = (
  startAt: number | null,
  dispatch: ActionDispatch<[client: ClientEvent]>,
  setBarProps: (state: { time: number; bpm: number }) => void
) => {
  const transport = useRef<TransportClass>(null as any);
  const players = useRef<Tone.Players>(null as any);
  const draw = useRef<DrawClass>(null as any);
  if (transport.current === null) {
    transport.current = Tone.getTransport();
    transport.current.bpm.value = track1.bpm;
  }

  if (draw.current === null) {
    draw.current = Tone.getDraw();
  }

  if (players.current === null)
    players.current = new Tone.Players({
      song: track1.song,
      clap: '/clap.wav',
    }).toDestination();

  useEffect(() => {
    if (!startAt) return;
    transport.current.seconds = 0;

    // clap
    transport.current.scheduleRepeat((time) => {
      players.current.player('clap').start(time);
      dispatch({ type: 'TICK' });
    }, '4n');

    // song
    transport.current.schedule((time) => {
      players.current.player('song').loop = true;
      players.current.player('song').volume.value = track1.volume;
      players.current.player('song').setLoopPoints(...track1.loopPoints);
      players.current.player('song').start(time, 0);
      draw.current.schedule(() => {
        setBarProps({ time: time, bpm: transport.current.bpm.value });
      }, time);
    }, `+${track1.offset}n`);

    console.log({ startAt });
    transport.current.start(`+${(startAt - now()) / 1000}`);

    return function cleanup() {
      if (transport.current.state === 'started') {
        transport.current.stop();
      }
    };
  }, [startAt]);

  return transport;
};

const now = () => performance.timeOrigin + performance.now();

export default useConductor;
