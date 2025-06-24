import { useEffect, useState } from 'react';
import { BeatBar } from './BeatBar';
import { useTransport } from '../client/useConductor';
import useGameState from '../client/useGameState';

const interval = 600; // ms
const duration = 2; // sec

export function BeatBarSpawner() {
  const [state, dispatch] = useGameState();
  const [bars, setBars] = useState<{ id: number }[]>([]);

  const spawn = () => {
    const id = Date.now();
    setBars((prev) => [...prev, { id }]);
  };

  console.log(`${state.startAt}`);

  useTransport(state.startAt, spawn);

  // useEffect(() => {

  //   // const timer = setInterval(spawn, interval);

  //   return () => clearInterval(timer);
  // }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setBars((prev) => prev.filter((bar) => now - bar.id < duration * 1000));
    }, 1000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className='fixed bottom-0 z-50 w-full'>
      <div className='relative w-full h-20 bg-black overflow-hidden'>
        {bars.map((bar) => (
          <BeatBar key={bar.id} id={bar.id} duration={duration} />
        ))}
      </div>
    </div>
  );
}
export default BeatBarSpawner;
