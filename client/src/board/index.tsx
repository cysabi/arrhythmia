import type { Entity, GameState } from "../types";
import { Player1, Player2, Projectile } from "./entities";



const Entity = ({ entity }: { entity: Entity }) => {
  console.log(entity.id, parseFloat( entity.id.split("_")[1] ))
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
      {entity.type === "player" && (
        parseFloat(entity.id.split("_")[1]) % 2
          ? <Player1 /> 
          : <Player2 />
        )
      }
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
        <Entity key={entity.id} entity={entity} />
      ))}
    </div>
  );
};

export default Board;
