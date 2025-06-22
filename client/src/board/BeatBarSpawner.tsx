import { useEffect, useState } from "react";
import { BeatBar } from "./BeatBar";

const interval = 600; // ms
const duration = 2; // sec

export function BeatBarSpawner() {
  const [bars, setBars] = useState<{ id: number }[]>([]);

  useEffect(() => {
    const spawn = () => {
      const id = Date.now();
      setBars((prev) => [...prev, { id }]);
    };

    const timer = setInterval(spawn, interval);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setBars((prev) => prev.filter((bar) => now - bar.id < duration * 1000));
    }, 1000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="relative w-full h-20 bg-black overflow-hidden">
      {bars.map((bar) => (
        <BeatBar key={bar.id} id={bar.id} duration={duration} />
      ))}
    </div>
  );
}
export default BeatBarSpawner;
