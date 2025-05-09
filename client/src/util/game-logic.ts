import type { GameState, Action, Entity, Position, Direction } from "../types";

function getNextPosition(
	d: Direction,
	p: Position,
	map: GameState["map"],
): Position {
	// TODO: use direction
	return [entity.position[0], entity.position[1] + 1];

	// TODO: coerce to bounds
}

export function applyAction(
	action: Action,
	currentState: GameState,
): GameState {
	const { entities, map } = currentState;
	// Create a new game state given action
	return {
		map: { ...map },
		entities: entities.reduce((newEntities, entity) => {
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

export function progressGame(
	actions: Action[],
	currentState: GameState,
): GameState {
	// Apply the given actions and progress any turns that have
	// completed in the action set (projectiles, etc)
	// TODO: moving projectiles
	// TODO: prevent collisions w/ walls?
}

const implicitInitialState: GameState = {
	map: {
		height: 20,
		width: 20,
	},
	entities: [
		{
			type: "player",
			id: "1",
			position: [2, 10],
			facing: "right",
		},
		{
			type: "player",
			id: "2",
			position: [18, 10],
			facing: "left",
		},
	],
};

// for dev only!
export const sampleActionList: Action[] = [
	{
		playerId: "1",
		turnCount: 0,
		action: "moveLeft",
		checksum: "abc123",
	},
	{
		playerId: "2",
		turnCount: 0,
		action: "shoot",
		checksum: "abc123",
	},
	{
		playerId: "1",
		turnCount: 1,
		action: "skip",
		checksum: "abc1234",
	},
	{
		playerId: "2",
		turnCount: 1,
		action: "moveDown",
		checksum: "abc1234",
	},
];
