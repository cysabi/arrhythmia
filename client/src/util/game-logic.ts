import type { GameState, Action, Entity, Position, Direction } from "../types";

function getNextPosition(
	d: Direction,
	p: Position,
	map: GameState["map"],
): Position {
	let nextPos: Position = [...p];
	switch (d) {
		case "down":
			nextPos[1] += 1;
			break;
		case "up":
			nextPos[1] -= 1;
			break;
		case "left":
			nextPos[0] -= 1;
			break;
		case "right":
			nextPos[0] += 1;
			break;
	}

	nextPos[0] = Math.min(Math.max(nextPos[0], 0), map.width);
	nextPos[1] = Math.min(Math.max(nextPos[1], 0), map.height);

	return nextPos;
}

export function applyAction(
	action: Action,
	currentState: GameState,
): GameState {
	const { turn, entities, map } = currentState;
	// Create a new game state given action
	return {
		turn,
		map: { ...map },
		entities: entities.reduce((newEntities: Entity[], entity) => {
			if (entity.type !== "player" || entity.id !== action.playerId) {
				newEntities.push(entity);
				return newEntities;
			}

			switch (action.action) {
				case "skip":
					newEntities.push(entity);
					break;
				case "shoot":
					newEntities.push(entity);
					newEntities.push({
						id: getNextId(),
						type: "fireball",
						owner: entity.id,
						position: getNextPosition(entity.facing, entity.position, map),
						facing: entity.facing,
					});
					break;
				case "moveDown":
				case "moveUp":
				case "moveLeft":
				case "moveRight":
					newEntities.push({
						...entity,
						position: getNextPosition(entity.facing, entity.position, map),
					});

					break;
			}

			return newEntities;
		}, []),
	};
}

function advanceTurn(game: GameState): GameState {
	// TODO: Move projectiles, detect collisions
	return game;
}

export function progressGame(actions: Action[], game: GameState): GameState {
	// Apply the given actions and progress any turns that have
	// completed in the action set (projectiles, etc)
	if (actions.length === 0) return game;

	const [action, ...rest] = actions;
	if (game.turn < action.turnCount) advanceTurn(game);
	const nextGameState = applyAction(action, game);
	return progressGame(rest, nextGameState);
}

let id = 0;
const getNextId = () => {
	id++;

	return id.toString();
};

const implicitInitialState: GameState = {
	map: {
		height: 20,
		width: 20,
	},
	entities: [
		{
			type: "player",
			id: getNextId(),
			position: [2, 10],
			facing: "right",
		},
		{
			type: "player",
			id: getNextId(),
			position: [18, 10],
			facing: "left",
		},
	],
	turn: 0,
};

// for dev only!

const sampleActionList: Action[] = [
	{
		playerId: "1",
		turnCount: 1,
		action: "moveLeft",
		checksum: "abc123",
	},
	{
		playerId: "2",
		turnCount: 1,
		action: "shoot",
		checksum: "abc123",
	},
	{
		playerId: "1",
		turnCount: 2,
		action: "skip",
		checksum: "abc1234",
	},
	{
		playerId: "2",
		turnCount: 2,
		action: "moveDown",
		checksum: "abc1234",
	},
];

export const sampleGameState = progressGame(
	sampleActionList,
	implicitInitialState,
);
