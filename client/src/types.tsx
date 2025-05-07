// websocket communication types
export type Direction = "up" | "down" | "left" | "right";
export type Action = `move${Capitalize<Direction>}` | "skip" | "shoot";

export type TurnPayload = {
  playerId: string;
  turnCount: number;
  action: Action;
  checksum: string;
};

export type CatchupPayload = {
  turns: TurnPayload[];
};

// spawn entities representation
export type Player = {
  playerId: string;
  position: [number, number];
};

export type Entity = Fire;
export type Fire = {
  spawnTurnCount: number;
  spawnPosition: [number, number];
  direction: Direction;
};

// convert to board state
export type GameState = {
  board: Tile[][];
  players: Player[];
  entities: Entity[];
};
export type Tile = "playerSelf" | "playerOther" | "fire" | "wall" | null;
