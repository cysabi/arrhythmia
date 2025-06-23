import { PlayerWrapper } from "../hud/player-wrapper";
import type { Entity, GameState } from "../types";
import { Projectile, Wall, getAvatar } from "./entities";

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
      {entity.type === "player" && (
        <PlayerWrapper player={entity}>
          {getAvatar(entity.avatarId)}
        </PlayerWrapper>
      )}
      {entity.type === "projectile" && <Projectile />}
      {entity.type === "wall" && <Wall />}
    </div>
  );
};

const Board = ({ gameState }: { gameState: GameState }) => {
  return (
    <div className="flex items-center justify-center h-full max-h-screen max-w-screen p-24">
      <div
        className="grid max-h-full max-w-full aspect-square"
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
    </div>
  );
};

export default Board;
