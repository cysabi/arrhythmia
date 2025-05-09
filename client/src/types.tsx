export type Direction = "up" | "down" | "left" | "right";
export type ActionType = `move${Capitalize<Direction>}` | "skip" | "shoot";

export type Position = [number, number];

// websocket communication types
export type Action = {
	playerId: ID;
	turnCount: number;
	action: ActionType;
	checksum: string;
};

export type CatchupPayload = {
	actions: Action[];
};

// spawn entities representation
export type ID = string;
export type Entity = Player | Fireball;

export type Player = {
	type: "player";
	id: ID;
	position: Position;
	facing: Direction;
};
export type Fireball = {
	type: "fireball";
	id: ID;
	owner: Player["id"];
	position: Position;
	facing: Direction;
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

export type Tile = "wall" | "empty";
