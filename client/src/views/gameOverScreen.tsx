import { getPlayerNumber, getAvatar } from "../board/entities";
import type { Player } from "../types";
import styles from "./views.module.css";

export const GameOverScreen = ({ winner }: { winner: Player }) => {
  const { id, avatarId } = winner;

  return (
    <div
      className={`flex justify-center items-center w-screen h-screen ${styles.Background}`}
    >
      <div className="flex-col items-center gap-5">
        <div className={`text-center ${styles.Title}`}>GAME OVER</div>
        <div
          className={`text-center ${styles.Subtitle}`}
        >{`Winner: Player ${getPlayerNumber(id)}`}</div>
        <div className={`flex justify-center`}>{getAvatar(avatarId)}</div>
      </div>
    </div>
  );
};
