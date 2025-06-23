import type { Position, Direction, ID } from "../types";

export const BOMB_TIME = 4;
export const WALL_WIDTH = 20;
export const WALL_HEIGHT = 20;
export const DEFAULT_HEALTH = 5;
export const DEFAULT_PLAYER_POSITIONS: [Position, Direction][] = [
  [[2, 2], "right"],
  [[18, 18], "left"],
  [[2, 18], "right"],
  [[18, 2], "left"],
];

const generateBorderWalls = (): [Position, ID][] => {
  const walls: [Position, ID][] = [];

  //left side
  for (let i = 1; i <= WALL_HEIGHT; i++) {
    walls.push([[1, i], `wall_left${i}`]);
  }

  // right side
  for (let i = 1; i <= WALL_HEIGHT; i++) {
    walls.push([[WALL_WIDTH, i], `wall_right${i}`]);
  }

  // top side
  for (let i = 2; i <= WALL_WIDTH - 1; i++) {
    walls.push([[i, 1], `wall_top${i}`]);
  }

  // bottom side
  for (let i = 2; i <= WALL_WIDTH - 1; i++) {
    walls.push([[i, WALL_WIDTH], `wall_bottom${i}`]);
  }

  return walls;
};

export const WALL_POSITIONS: [Position, ID][] = [
  ...generateBorderWalls(),
  [[5, 3], "wall_inner1"],
  [[5, 4], "wall_inner2"],
  [[5, 5], "wall_inner3"],
  [[5, 7], "wall_inner4"],
  [[5, 8], "wall_inner5"],
  [[5, 9], "wall_inner6"],
  [[5, 11], "wall_inner7"],
  [[5, 12], "wall_inner8"],
  [[5, 13], "wall_inner9"],
  [[5, 15], "wall_inner10"],
  [[5, 16], "wall_inner11"],
  [[5, 17], "wall_inner12"],
  [[16, 3], "wall_inner13"],
  [[16, 4], "wall_inner14"],
  [[16, 5], "wall_inner15"],
  [[16, 7], "wall_inner16"],
  [[16, 8], "wall_inner17"],
  [[16, 9], "wall_inner18"],
  [[16, 11], "wall_inner19"],
  [[16, 12], "wall_inner20"],
  [[16, 13], "wall_inner21"],
  [[16, 15], "wall_inner22"],
  [[16, 16], "wall_inner23"],
  [[16, 17], "wall_inner24"],
];
