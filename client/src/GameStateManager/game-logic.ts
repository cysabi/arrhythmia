import type {
  GameState,
  ActionPayload,
  Entity,
  Position,
  Direction,
} from "../types";

const defaultHealth = 5;

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
  const { turn, entities, map } = currentState;

  return {
    turn,
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
  const { entities, map, turn, ...rest } = game;

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
    turn: turn + 1,
    // convert map back to a list
    entities: [...positionsMap.values()],
    ...rest,
  };
}

export function progressGame(
  game: GameState,
  actions: ActionPayload[],
  turnCount: number
): GameState {
  // Apply the given actions and progress any turns that have
  // completed in the action set (projectiles, etc)
  if (actions.length === 0) return game;
  const [action, ...rest] = actions;

  if (game.turn < action.turnCount) game = tick(game);
  const nextGameState = applyAction(action, game);

  return progressGame(nextGameState, rest, turnCount);
}

// TODO: this is just a hack -- need something that's consistent
// across peers
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
      health: defaultHealth,
    },
    {
      type: "player",
      id: "2",
      position: [18, 10],
      facing: "left",
      health: defaultHealth,
    },
  ],
  turn: 0,
};

// for dev only!

const sampleActionList: ActionPayload[] = [
  {
    playerId: "1",
    turnCount: 1,
    action: "moveRight",
  },
  {
    playerId: "2",
    turnCount: 1,
    action: "shoot",
  },
  {
    playerId: "1",
    turnCount: 2,
    action: "moveUp",
  },
  {
    playerId: "2",
    turnCount: 2,
    action: "moveDown",
  },
  {
    playerId: "1",
    turnCount: 3,
    action: "skip",
  },
  {
    playerId: "2",
    turnCount: 3,
    action: "skip",
  },
  {
    playerId: "1",
    turnCount: 4,
    action: "skip",
  },
  {
    playerId: "2",
    turnCount: 4,
    action: "skip",
  },
  {
    playerId: "1",
    turnCount: 5,
    action: "skip",
  },
  {
    playerId: "2",
    turnCount: 5,
    action: "skip",
  },
];

export const sampleGameState: GameState = progressGame(
  implicitInitialState,
  sampleActionList,
  3
);
