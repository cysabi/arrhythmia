import type { GameState } from "../types";
import { Player, Projectile, Wall } from "./entities";

const Board = ({
  gameState,
  tooltipData,
}: {
  gameState: GameState;
  tooltipData: { playerId: string; feedback: string };
}) => {
  return (
    <div className="flex items-center justify-center h-full max-h-screen max-w-screen p-2">
      <div
        className="grid max-h-full max-w-full aspect-square"
        style={{
          gridTemplateColumns: `repeat(${gameState.map.width}, ${
            100 / gameState.map.width
          }%)`,
          gridTemplateRows: `repeat(${gameState.map.height}, ${
            100 / gameState.map.height
          }%)`,
          backgroundImage: 'url("/grass tile.png")',
          backgroundRepeat: "repeat",
          backgroundSize: `${100 / gameState.map.width}% ${100 / gameState.map.height}%`,
        }}
      >
        {gameState.entities.map((entity) => (
          <div
            key={
              entity.type +
              "_" +
              entity.id +
              entity.position[0] +
              entity.position[1]
            }
            style={{
              gridColumn: entity.position[0],
              gridRow: entity.position[1],
            }}
          >
            {entity.type === "player" && (
              <Player entity={entity} tooltipData={tooltipData} />
            )}
            {entity.type === "projectile" && (
              <Projectile entity={entity} turnCount={gameState.turnCount} />
            )}
            {entity.type === "wall" && <Wall />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
