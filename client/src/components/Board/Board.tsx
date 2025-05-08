import React from 'react';
import Tile from './Tile';
import type { GameState } from '../../types';
// import playerImg from './player.png';
import Player from './Player';

const Board = () => {
  const gameState: GameState = {
    map: {
      height: 10,
      width: 10,
    },
    entities: [
      {
        type: 'player',
        id: '1',
        position: [2, 2],
        facing: 'down',
      },
      {
        type: 'player',
        id: '2',
        position: [9, 9],
        facing: 'up',
      },
      // {
      //   type: "fireball",
      //   owner: "1",
      //   position: [3, 3],
      //   facing: "up",
      // },
    ],
  };

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
            key={entity?.id || entity?.owner}
            style={{
              gridColumn: x,
              gridRow: y,
            }}
          >
            <Player />
          </div>
        );
      })}
    </div>
  );
};

export default Board;
