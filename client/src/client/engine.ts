import type {
  GameState,
  ActionPayload,
  Entity,
  Position,
  Direction,
} from "../types";

const defaultHealth = 5;
let projectileId = 0;

function isSamePosition(p1: Position, p2: Position): boolean {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

function getNextPosition(
  direction: Direction,
  currentPosition: Position,
  map: GameState["map"]
): Position {
  let nextPosition: Position = [...currentPosition];
  switch (direction) {
    case "down":
      nextPosition[1] += 1;
      break;
    case "up":
      nextPosition[1] -= 1;
      break;
    case "left":
      nextPosition[0] -= 1;
      break;
    case "right":
      nextPosition[0] += 1;
      break;
  }

  // Enforce map boundary
  nextPosition[0] = Math.min(Math.max(nextPosition[0], 0), map.width - 1);
  nextPosition[1] = Math.min(Math.max(nextPosition[1], 0), map.height - 1);

  return nextPosition;
}

export function applyAction(
  action: ActionPayload,
  currentState: GameState
): GameState {
  const { turnCount: turn, entities, map } = currentState;

  return {
    turnCount: turn,
    map,
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
            type: "projectile",
            id: `${entity.id}-${projectileId++}`,
            owner: entity.id,
            position: getNextPosition(entity.facing, entity.position, map),
            facing: entity.facing,
          });
          break;
        case "moveUp":
        case "moveDown":
        case "moveLeft":
        case "moveRight":
          // "moveDown" -> "down"
          const direction = action.action
            .replace("move", "")
            .toLowerCase() as Direction;
          newEntities.push({
            ...entity,
            facing: direction,
            position: getNextPosition(direction, entity.position, map),
          });

          break;
      }

      return newEntities;
    }, []),
  };
}

function tick(game: GameState): GameState {
  const { entities, map, turnCount: turn, ...rest } = game;

  // Build up a "linearized" map of where everything is to make
  // collision detection a constant-time lookup
  const positionsMap = new Map<number, Entity>();
  function positionToIndex(p: Position) {
    return p[0] * map.width + p[1];
  }

  // 1. move projectiles and put in the map
  entities
    .filter((e) => e.type === "projectile")
    .forEach((projectile) => {
      const { facing, position } = projectile;
      // If projectile hits a boundary and cannot move, it must go away
      const nextPosition = getNextPosition(facing, position, map);
      if (isSamePosition(nextPosition, position)) return;

      // Put projectile in hashmap, checking for projectile <=> projectile collisions
      const positionIdx = positionToIndex(nextPosition);
      if (positionsMap.has(positionIdx)) {
        // collision -- goodbye to both
        positionsMap.delete(positionIdx);
      } else {
        positionsMap.set(positionIdx, {
          ...projectile,
          position: nextPosition,
        });
      }
    });

  // 2. put players in the map, checking again for collisions
  entities
    .filter((e) => e.type === "player")
    .forEach((player) => {
      const positionIdx = positionToIndex(player.position);
      if (positionsMap.get(positionIdx)) {
        // collision -- overwrite projectile and deal damage
        positionsMap.set(positionIdx, { ...player, health: player.health - 1 });
      } else {
        positionsMap.set(positionIdx, { ...player });
      }
    });

  return {
    map,
    turnCount: turn + 1,
    // convert map back to a list
    entities: [...positionsMap.values()],
    ...rest,
  };
}

export function progressGame(
  game: GameState,
  actions: ActionPayload[],
  desiredTurnCount: number
): GameState {
  // Apply the given actions and progress any turns that have
  // completed in the action set (projectiles, etc)
  for (let action of actions) {
    if (action.turnCount > desiredTurnCount) {
      break;
    }
    if (action.turnCount > game.turnCount) {
      game = tick(game);
    }
    game = applyAction(action, game);
  }

  // continue to tick game up to desiredTurnCount even if we don't have actions for those turns
  while (desiredTurnCount > game.turnCount) {
    game = tick(game);
  }

  return game;
}

const defaultPositions = [
  [[2, 2], "right"],
  [[18, 18], "left"],
  [[2, 18], "right"],
  [[18, 2], "left"],
];

export function ensurePlayers(
  game: GameState,
  payload: { playerIds: string[] }
): GameState {
  // Creates any missing entities for the provided ids
  // Repositions players in starting positions according to ID sorting
  // Guarantees that all clients have consistent positions for all players.
  const { playerIds } = payload;
  const existingPlayerIds = game.entities
    .filter((e) => e.type === "player")
    .map((e) => e.id);
  const orderedIds = [...new Set([...existingPlayerIds, ...playerIds])].sort();
  return {
    ...game,
    entities: orderedIds.map((id) => {
      const [position, facing] = defaultPositions[orderedIds.indexOf(id)];
      return {
        id,
        position: position as Position,
        facing: facing as Direction,
        type: "player",
        health: defaultHealth,
      };
    }),
  };
}

export const initialState: GameState = {
  map: {
    height: 20,
    width: 20,
  },
  entities: [],
  turnCount: 0,
};
