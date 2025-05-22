// player actions
export type ActionPayload = {
  playerId: ID;
  turnCount: number;
  action: Action;
};

export type Action = `move${Capitalize<Direction>}` | "skip" | "shoot";
export type Direction = "up" | "down" | "left" | "right";

// game state
export type GameState = {
  map: {
    height: number;
    width: number;
  };
  entities: Entity[];
  turn: number;
};

export type Entity = Player | Projectile;
export type Player = {
  type: "player";
  id: ID;
  position: Position;
  facing: Direction;
  health: number;
};
export type Projectile = {
  type: "projectile";
  owner: Player["id"];
  position: Position;
  facing: Direction;
};
export type Wall = {
  type: "wall";
  position: Position;
};

// alias
export type Position = [number, number];
export type ID = string;
