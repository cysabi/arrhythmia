import React from 'react';
import Tile from './Tile';
// import playerImg from './player.png';
import Player from './Player';

const Board = () => {
  const rows = 10;
  const cols = 10;

  const board = {
    rows,
    cols,
    players: [
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 9, y: 9 },
    ],
  };

  return (
    <div className='flex flex-col'>
      {[...Array(board.rows).keys()].map((y) => (
        <div className='flex flex-row' key={y}>
          {[...Array(board.cols).keys()].map((x) => (
            <div className='relative'>
              {board.players
                .filter((player) => {
                  return player.x === x && player.y === y;
                })
                .map((_player) => {
                  return (
                    <div className='absolute'>
                      <Player />
                    </div>
                  );
                })}
              <Tile key={x} coords={{ x: x, y: y }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
