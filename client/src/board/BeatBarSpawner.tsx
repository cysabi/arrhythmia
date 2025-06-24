import { useEffect, useState } from "react";
import { BeatBar } from "./BeatBar";

const interval = 600; // ms between bar spawns
const duration = 2000; // ms for bar to reach center

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

  return (
    <div className="relative w-full h-20 bg-black overflow-hidden">
      {bars.map((bar) => (
        <BeatBar key={bar.id} id={bar.id} duration={duration} />
      ))}
    </div>
  );
}
