import useClient from "./client/useClient";
import Board from "./board";
import { BeatBar } from "./hud/BeatBar";
import { StartScreen } from "./views/startScreen";
import { GameOverScreen } from "./views/gameOverScreen";
import { Hud } from "./hud/hud";
import type { GameState, Player } from "./types";

const getWinner = (view: GameState): Player | null => {
  const { entities } = view;
  const playersAlive: Player[] = entities.filter(
    (e): e is Player => e.type === "player" && e.health > 0
  );
  return playersAlive.length === 1 ? playersAlive[0] : null;
};

function App() {
  const { ws, conductor, view, tooltipData, cooldowns } = useClient();

  if (!ws.connected) {
    return "connecting...";
  }

  if (conductor.status !== "playing") {
    return <StartScreen status={conductor.status} send={ws.send} />;
  }

  const winner = getWinner(view);
  if (winner) {
    return <GameOverScreen winner={winner}></GameOverScreen>;
  }

  return (
    <div className="h-svh w-svw flex flex-col">
      {/* <OpponentHealth gameState={view} /> */}

      <div className="flex items-center justify-center h-[80svh]">
        <Board gameState={view} tooltipData={tooltipData} />
      </div>
      <div className="20svh w-[80svh] mx-auto -translate-y-10">
        <BeatBar barProps={conductor.barProps} />
        <div className="flex items-center justify-between">
          <Hud devFlag={false} gameState={view} />
          <div className="flex gap-4">
            <Ability
              num="1"
              name="projectile-basic"
              cooldown={cooldowns.basic}
            />
            <Ability num="2" name="projectile-bomb" cooldown={cooldowns.bomb} />
            <Ability
              num="3"
              name="projectile-asplode2"
              cooldown={cooldowns.diag_cross}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const Ability = ({
  num,
  name,
  cooldown,
}: {
  num: string;
  name: string;
  cooldown: number;
}) => {
  return (
    <div className="flex flex-col gap-1 items-center font-['Press_Start_2P']">
      <div className="text-[#808080]">{num}</div>
      <div className="flex h-16 w-16 border-2 border-[#808080] relative items-center justify-center">
        <img
          className="h-full w-full"
          src={`/${name}.svg`}
          style={{
            opacity: cooldown > 0 ? "0.5" : "1",
            filter: cooldown > 0 ? "grayscale(1)" : "",
          }}
        />
        {cooldown > 0 && <div className="absolute text-xl">{cooldown}</div>}
      </div>
    </div>
  );
};

export default App;
