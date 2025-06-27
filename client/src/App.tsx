import useClient from "./client/useClient";
import Board from "./board";
import { BeatBar } from "./hud/BeatBar";
import { StartScreen } from "./views/startScreen";
import { GameOverScreen } from "./views/gameOverScreen";
import { Hud } from "./hud/hud";
import type { GameState, Player } from "./types";
import srcBasic from "/projectile-basic.svg";
import srcBomb from "/projectile-bomb.svg";
import srcDiag from "/projectile-asplode2.svg";

function App() {
  const { view, send, status } = useClient();

  console.log(status);

  if (status.state !== "play") {
    return <StartScreen status={status} send={send} />;
  }

  if (!import.meta.env.DEV) {
    const winner = getWinner(view);
    if (winner) {
      return <GameOverScreen winner={winner}></GameOverScreen>;
    }
  }

  return (
    <div className="h-svh w-svw flex flex-col">
      <div className="flex items-center justify-center h-[80svh]">
        <Board
          gameState={view}
          playerId={status.playerId}
          tooltip={status.tooltip}
          beatBar={<BeatBar barProps={status.barProps} />}
        />
      </div>
      <div className="20svh max-w-[80svh] mx-auto w-full">
        <div className="flex items-center justify-between">
          <Hud devFlag={false} gameState={view} />
          <div className="flex gap-4">
            <Ability num="1" src={srcBasic} cooldown={status.cooldowns.basic} />
            <Ability num="2" src={srcBomb} cooldown={status.cooldowns.bomb} />
            <Ability
              num="3"
              src={srcDiag}
              cooldown={status.cooldowns.diag_cross}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const Ability = ({
  num,
  src,
  cooldown,
}: {
  num: string;
  src: string;
  cooldown: number;
}) => {
  return (
    <div className="flex flex-col gap-1 items-center">
      <div className="opacity-0">{num}</div>
      <div className="flex h-16 w-16 border-2 border-[#808080] relative items-center justify-center">
        <img
          className="h-full w-full"
          src={src}
          style={{
            opacity: cooldown > 0 ? "0.5" : "1",
            filter: cooldown > 0 ? "grayscale(1)" : "",
          }}
        />
        {cooldown > 0 && <div className="absolute text-xl">{cooldown}</div>}
      </div>
      <div className="text-[#808080]">{num}</div>
    </div>
  );
};

const getWinner = (view: GameState): Player | null => {
  const { entities } = view;
  const playersAlive: Player[] = entities.filter(
    (e): e is Player => e.type === "player" && e.health > 0
  );
  return playersAlive.length === 1 ? playersAlive[0] : null;
};

export default App;
