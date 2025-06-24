import { useEffect, useState } from "react";

interface BeatBarProps {
  id: number;
  duration: number; // ms
}

export function BeatBar({ duration }: BeatBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let startTime: number | null = null;

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      if (newProgress < 1) {
        requestAnimationFrame(step);
      } else {
        setVisible(false);
      }
    }

    requestAnimationFrame(step);
  }, [duration]);

  const left = progress * 50;
  const right = 100 - progress * 50;

  return (
    <>
      <img
        src="beat-bar.svg"
        className="absolute h-full transition-opacity duration-300"
        style={{
          left: `${left}%`,
          transform: "translateX(-50%)",
          opacity: visible ? 1 : 0,
        }}
      />
      <img
        src="beat-bar.svg"
        className="absolute h-full transition-opacity duration-300"
        style={{
          left: `${right}%`,
          transform: "translateX(-50%)",
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  );
}
