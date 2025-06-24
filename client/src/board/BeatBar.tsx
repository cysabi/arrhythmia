import { useEffect, useState } from 'react';

interface BeatBarProps {
  id: number;
  duration: number; // seconds from edge to center
}

export function BeatBar({ duration }: BeatBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);
      if (newProgress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [duration]);

  const leftBarLeftPercent = progress * 50;
  const rightBarLeftPercent = 100 - progress * 50;

  return (
    <>
      <img
        src='beat-bar.svg'
        className='absolute h-full'
        style={{
          left: `${leftBarLeftPercent}%`,
          transform: 'translateX(-50%)',
        }}
      />
      <img
        src='beat-bar.svg'
        className='absolute h-full'
        style={{
          left: `${rightBarLeftPercent}%`,
          transform: 'translateX(-50%)',
        }}
      />
    </>
  );
}
