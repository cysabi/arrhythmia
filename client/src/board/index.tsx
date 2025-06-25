import type { GameState } from "../types";
import { Player, Projectile, Wall } from "./entities";
import grassTile from "/grass tile.png";

const Board = ({
  gameState,
  tooltipData,
  beatBar,
}: {
  gameState: GameState;
  tooltipData: { playerId: string; feedback: string };
  beatBar: any;
}) => {
  return (
    <div
      className="relative grid max-h-full max-w-full aspect-square"
      style={{
        gridTemplateColumns: `repeat(${gameState.map.width}, ${
          100 / gameState.map.width
        }%)`,
        gridTemplateRows: `repeat(${gameState.map.height}, ${
          100 / gameState.map.height
        }%)`,
        backgroundImage: `url("${grassTile}")`,
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
      <div className="absolute inset-0 flex justify-end items-end max-w-[80svh] w-full mt-auto mx-auto">
        {beatBar}
      </div>
    </div>
  );
};

export default Board;
