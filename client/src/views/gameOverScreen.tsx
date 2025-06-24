import { getWinAvatar } from "../board/entities";
import type { Player } from "../types";
import styles from "./views.module.css";

export const GameOverScreen = ({ winner }: { winner: Player }) => {
  const { avatarId, you } = winner;

  return (
    <div
      className={`flex justify-center items-center w-screen h-screen ${styles.Background}`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className={`text-center ${styles.Title}`}>GAME OVER</div>
        <div className={`text-center ${styles.Subtitle}`}>
          {" "}
          {`${you ? "YOU WIN!" : "YOU LOSE"}`}{" "}
        </div>
        <div className={`flex justify-center`}>{getWinAvatar(avatarId)}</div>
      </div>
    </div>
  );
};
