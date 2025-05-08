import React from "react";
import Tile from "./Tile";
// import playerImg from './player.png';
import Player from "./Player";
import type { GameState } from "../../types";

const rows = 10;
const cols = 10;

const gameState: GameState = {
  map: Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "empty")
  ),
  entities: [
    {
      type: "player",
      id: "1",
      position: [2, 2],
      facing: "down",
    },
    {
      type: "player",
      id: "2",
      position: [9, 9],
      facing: "up",
    },
    // {
    //   type: "fireball",
    //   owner: "1",
    //   position: [3, 3],
    //   facing: "up",
    // },
  ],
};

const Board = () => {
  return (
    <div className="flex flex-col">
      {gameState.map.map((_, y) => (
        <div className="flex flex-row" key={y}>
          {gameState.map[y].map((_, x) => (
            <div className="relative">
              {gameState.entities
                .filter((player) => {
                  if (player.type === "player")
                    return player.position[0] === x && player.position[1] === y;
                })
                .map((_player) => {
                  return (
                    <div className="absolute">
                      <Player />
                    </div>
                  );
                })}
              <Tile key={x} tile={"empty"} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
