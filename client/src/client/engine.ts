import type {
  GameState,
  ActionPayload,
  Entity,
  Position,
  Direction,
  Wall,
  ID,
} from "../types";
import {
  DEFAULT_HEALTH,
  DEFAULT_PLAYER_POSITIONS,
  WALL_HEIGHT,
  WALL_WIDTH,
  WALL_POSITIONS,
} from "./gameDefaults";

let projectileId = 0;

const initialState: GameState = {
  map: {
    height: WALL_HEIGHT,
    width: WALL_WIDTH,
  },
  entities: [],
  turnCount: 0,
};

const getDefaultPlayerEntities = (playerId: ID, peerIds: ID[]): Entity[] => {
  return peerIds.map((pid, i) => {
    const [position, facing] = DEFAULT_PLAYER_POSITIONS[i];
    return {
      type: "player",
      id: pid,
      position,
      facing,
      health: DEFAULT_HEALTH,
      you: playerId === pid,
    };
  });
};

const getWallEntities = (wallPositions: [Position, ID][]) => {
  let wallEntities: Wall[] = [];
  wallPositions.forEach(([position, id]) =>
    wallEntities.push({ type: "wall", position: position, id: id })
  );
  return wallEntities;
};

function isSamePosition(p1: Position, p2: Position): boolean {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

function getNextPosition(
  direction: Direction,
  currentPosition: Position,
  game: GameState
): Position {
  const { map, entities } = game;
  let nextPosition: Position = [...currentPosition];
  const wallPositions = entities
    .filter((e) => e.type === "wall")
    .map((e) => e.position);

  const wontCollideWithWall = (x: number, y: number) => {
    return (
      wallPositions.filter(([wx, wy]) => wx === x && wy === y).length === 0
    );
  };

  switch (direction) {
    case "down":
      if (wontCollideWithWall(nextPosition[0], nextPosition[1] + 1)) {
        nextPosition[1] += 1;
      }
      break;
    case "up":
      if (wontCollideWithWall(nextPosition[0], nextPosition[1] - 1)) {
        nextPosition[1] -= 1;
      }
      break;
    case "left":
      if (wontCollideWithWall(nextPosition[0] - 1, nextPosition[1])) {
        nextPosition[0] -= 1;
      }
      break;
    case "right":
      if (wontCollideWithWall(nextPosition[0] + 1, nextPosition[1])) {
        nextPosition[0] += 1;
      }
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
            position: getNextPosition(
              entity.facing,
              entity.position,
              currentState
            ),
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
            position: getNextPosition(direction, entity.position, currentState),
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

  // 0. add walls
  entities
    .filter((e) => e.type === "wall")
    .forEach((wall) => {
      const positionIdx = positionToIndex(wall.position);
      positionsMap.set(positionIdx, wall);
    });

  // 1. move projectiles and put in the map
  entities
    .filter((e) => e.type === "projectile")
    .forEach((projectile) => {
      const { facing, position } = projectile;
      // If projectile hits a boundary and cannot move, it must go away
      const nextPosition = getNextPosition(facing, position, game);
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

export function initGame(
  props:
    | {
        playerId: string;
        peerIds: string[];
      }
    | undefined = undefined
): GameState {
  const game = structuredClone(initialState);
  if (props === undefined) return game;

  const { playerId, peerIds } = props;

  const initialEntities = [
    ...getDefaultPlayerEntities(playerId, peerIds),
    ...getWallEntities(WALL_POSITIONS),
  ];

  return {
    ...game,
    entities: initialEntities,
  };
}
