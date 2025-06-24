import styles from "./beatbar.module.css";

export function BeatBarSpawner({
  barProps,
}: {
  barProps: { time: number; bpm: number };
}) {
  const duration = 60 / barProps.bpm;
  return (
    <div className="z-50 w-full flex relative">
      <div
        className={`flex-1 h-10 overflow-hidden ${styles.Bar}`}
        style={{
          backgroundImage: `url("/Sprite-0001.svg")`,
          backgroundSize: "50px 100%",
          // backgroundPositionX: '200px',
          animationDuration: `${duration}s`,
          animationIterationCount: "infinite",
          animationDelay: `${barProps.time % duration}s`,
          animationTimingFunction: "linear",
        }}
      ></div>
      <div
        className={`flex-1 h-10 overflow-hidden ${styles.Bar} rotate-180`}
        style={{
          backgroundImage: `url("/Sprite-0001.svg")`,
          backgroundSize: "50px 100%",
          // backgroundPositionX: '200px',
          animationDuration: `${duration}s`,
          animationIterationCount: "infinite",
          animationDelay: `${barProps.time % duration}s`,
          animationTimingFunction: "linear",
        }}
      ></div>
      <div className="absolute inset-0 flex justify-center">
        <div className="w-2 bg-blue-400"></div>
      </div>
    </div>
  );
}
