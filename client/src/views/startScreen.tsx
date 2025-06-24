import { useState, useEffect } from "react";
import { Skull } from "../board/entities";
import styles from "./views.module.css";

export const StartScreen = ({
  status,
  send,
}: {
  status: "scheduled" | "idle";
  send: WebSocket["send"];
}) => {
  const [playerVisible, setPlayerVisible] = useState(true);

  useEffect(() => {
    let timeoutId: number;

    const loop = () => {
      setPlayerVisible(true);
      timeoutId = setTimeout(() => {
        setPlayerVisible(false);
        timeoutId = setTimeout(loop, 1000);
      }, 2000);
    };

    loop();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className={`flex justify-center items-center w-screen h-screen ${styles.Background}`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className={`flex justify-center h-36 gap-60 ${styles.Bounce}`}>
          {playerVisible && (
            <>
              <img src="/hemmet.svg" alt="player1" />
              <img src="/binki.svg" alt="player1" />
            </>
          )}
          {!playerVisible && (
            <>
              <Skull />
              <Skull />
            </>
          )}
        </div>
        <div className={`${styles.Title}`}>DANCE DANCE EXECUTION</div>
        <button
          className={styles.Button}
          onClick={() => send("start")}
          disabled={status === "scheduled"}
        >
          {status === "idle" ? "START" : "READY..."}
        </button>
      </div>
    </div>
  );
};
