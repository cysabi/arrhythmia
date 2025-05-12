export type Direction = "up" | "down" | "left" | "right";
export type ActionType = `move${Capitalize<Direction>}` | "skip" | "shoot";

export type Position = [number, number];

// websocket communication types
export type Action = {
  playerId: ID;
  turnCount: number;
  actionType: ActionType;
};

export type CatchupPayload = {
  actions: Action[];
};

// spawn entities representation
export type ID = string;
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
  id: ID;
  owner: Player["id"];
  position: Position;
  facing: Direction;
};
export type Wall = {
  type: "wall";
  id: ID;
  position: Position;
};

// convert to board state
export type GameState = {
  map: {
    height: number;
    width: number;
  };
  entities: Entity[];
  turn: number;
};

export type GlobalState = {
  pendingTurns: Action[];
  snapshots: Record<number, GameState>;
};
