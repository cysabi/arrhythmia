import styles from "./beatbar.module.css";

export function BeatBar({
  barProps,
}: {
  barProps: { time: number; bpm: number };
}) {
  const duration = 60 / barProps.bpm;
  return (
    <div className="z-50 w-full h-20vh flex relative">
      <div
        className={`flex-1 h-10 overflow-hidden ${styles.Bar}`}
        style={{
          backgroundImage: `url("/beat-bar.svg")`,
          backgroundSize: "50px 100%",
          animationDuration: `${duration}s`,
          animationIterationCount: "infinite",
          animationDelay: `${barProps.time % duration}s`,
          animationTimingFunction: "linear",
        }}
      ></div>
      <div
        className={`flex-1 h-10 overflow-hidden ${styles.Bar} rotate-180`}
        style={{
          backgroundImage: `url("/beat-bar.svg")`,
          backgroundSize: "50px 100%",
          animationDuration: `${duration}s`,
          animationIterationCount: "infinite",
          animationDelay: `${barProps.time % duration}s`,
          animationTimingFunction: "linear",
        }}
      ></div>
      <div className="absolute inset-0 flex justify-center">
        <img src="/heartgem.svg" />
      </div>
    </div>
  );
}
