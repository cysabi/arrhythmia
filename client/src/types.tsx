export type Direction = 'up' | 'down' | 'left' | 'right';
export type Action = `move${Capitalize<Direction>}` | 'skip' | 'shoot';

// websocket communication types
export type TurnPayload = {
  playerId: PlayerId;
  turnCount: number;
  action: Action;
  checksum: string;
};

export type CatchupPayload = {
  turns: TurnPayload[];
};

// spawn entities representation
export type PlayerId = string;
export type Entity = Player | Fireball;

export type Player = {
  type: 'player';
  id: PlayerId;
  position: [number, number];
  facing: Direction;
};
export type Fireball = {
  type: 'fireball';
  owner: PlayerId;
  position: [number, number];
  facing: Direction;
};

// convert to board state
export type GameState = {
  map: {
    height: number;
    width: number;
  };
  entities: Entity[];
};
export type Tile = 'wall' | 'empty';
