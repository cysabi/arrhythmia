// player actions
export type ActionPayload = {
  playerId: ID;
  turnCount: number;
  action: Action;
  projectileType?: ProjectileType;
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
  turnCount: number;
};

export type Entity = Player | Projectile | Wall;
export type Player = {
  type: "player";
  id: ID;
  you: boolean;
  position: Position;
  facing: Direction;
  health: number;
};

export type ProjectileType =
  | "basic"
  | "spread"
  | "cross_of_death"
  | "diag_cross";

export type Projectile = {
  type: "projectile";
  id: ID;
  owner: Player["id"];
  position: Position;
  facing: Direction;
  projectileType: ProjectileType;
  diagFacing?: Direction; // for spread
  countdown: number | null; // for cross of death
};

export type Wall = {
  type: "wall";
  position: Position;
  id: ID;
};

// alias
export type Position = [number, number];
export type ID = string;
