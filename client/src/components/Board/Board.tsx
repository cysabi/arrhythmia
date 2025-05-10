import React from "react";
import type { Entity, GameState } from "../../types";
import Player from "./Player";
import Projectile from "./Projectile";

function renderEntity(e: Entity) {
  switch (e.type) {
    case "player":
      return <Player />;
    case "projectile":
      return <Projectile />;
  }
}

const Board = ({ gameState }: { gameState: GameState }) => {
  return (
    <div
      className={`grid h-full w-full`}
      style={{
        gridTemplateColumns: `repeat(${gameState.map.width}, ${
          100 / gameState.map.width
        }%)`,
        gridTemplateRows: `repeat(${gameState.map.height}, ${
          100 / gameState.map.height
        }%)`,
      }}
    >
      {gameState.entities.map((entity) => {
        const x = entity.position[0];
        const y = entity.position[1];
        return (
          <div
            key={entity.id}
            style={{
              gridColumn: x,
              gridRow: y,
            }}
          >
            {renderEntity(entity)}
          </div>
        );
      })}
    </div>
  );
};

export default Board;
