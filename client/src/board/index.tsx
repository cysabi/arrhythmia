import type { Entity, GameState } from "../types";
import { Player, Projectile } from "./entities";

const Entity = ({ entity }: { entity: Entity }) => {
  const x = entity.position[0];
  const y = entity.position[1];
  return (
    <div
      key={entity.type + "_" + x + y}
      style={{
        gridColumn: x,
        gridRow: y,
      }}
    >
      {entity.type === "player" && <Player />}
      {entity.type === "projectile" && <Projectile />}
    </div>
  );
};

const Board = ({ gameState }: { gameState: GameState }) => {
  return (
    <div
      className="grid h-full w-full"
      style={{
        gridTemplateColumns: `repeat(${gameState.map.width}, ${
          100 / gameState.map.width
        }%)`,
        gridTemplateRows: `repeat(${gameState.map.height}, ${
          100 / gameState.map.height
        }%)`,
      }}
    >
      {gameState.entities.map((entity) => (
        <Entity entity={entity} />
      ))}
    </div>
  );
};

export default Board;
