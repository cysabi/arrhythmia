import { assignAvatarId } from "../board/entities";
import type {
  GameState,
  ActionPayload,
  Entity,
  Position,
  Direction,
  Wall,
  ID,
  Projectile,
} from "../types";
import {
  DEFAULT_HEALTH,
  DEFAULT_PLAYER_POSITIONS,
  WALL_HEIGHT,
  WALL_WIDTH,
  WALL_POSITIONS,
  BOMB_TIME,
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
      avatarId: assignAvatarId(pid),
    };
  });
};

const getWallEntities = (wallPositions: [Position, ID][]) => {
  let wallEntities: Wall[] = [];
  wallPositions.forEach(([position, id]) =>
    wallEntities.push({ type: "wall", position: position, id: id }),
  );
  return wallEntities;
};

function isSamePosition(p1: Position, p2: Position): boolean {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

function getNextPosition(
  direction: Direction,
  currentPosition: Position,
  game: GameState,
  diagDir?: Direction,
): Position {
  const { map, entities } = game;
  let nextPosition: Position = [...currentPosition];
  const wallPositions = entities
    .filter(
      (e) =>
        e.type === "wall" ||
        // Treat bombs as walls
        (e.type === "projectile" && e.projectileType === "bomb"),
    )
    .map((e) => e.position);

  const wontCollideWithWall = (x: number, y: number) => {
    return (
      wallPositions.filter(([wx, wy]) => wx === x && wy === y).length === 0
    );
  };

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

  switch (diagDir) {
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

  if (
    wontCollideWithWall(nextPosition[0], nextPosition[1]) &&
    nextPosition[0] >= 0 &&
    nextPosition[0] < map.width &&
    nextPosition[1] >= 0 &&
    nextPosition[1] < map.height
  ) {
    return nextPosition;
  } else {
    return [...currentPosition];
  }
}

const orderedDirections: Direction[] = ["up", "right", "down", "left"];

export function applyAction(
  action: ActionPayload,
  currentState: GameState,
): GameState {
  const { turnCount: turn, entities, map } = currentState;
  // projectile doesn't seem to show up here in entities list
  // const entityTypes = entities
  //   .filter((e) => e.type != "wall")
  //   .reduce((newEntities: Entity["type"][], entity) => {
  //     newEntities.push(entity.type);
  //     return newEntities;
  //   }, []);
  // console.log({ entityTypes });
  // console.log("action:", action.action);

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
          // console.log("shoot happening");
          newEntities.push(entity);
          const projectileType = action.projectileType;
          const projectile = {
            projectileType,
            type: "projectile",
            id: `${entity.id}-${projectileId++}`,
            owner: entity.id,
            position: getNextPosition(
              entity.facing,
              entity.position,
              currentState,
            ),
            facing: entity.facing,
            birthTurn: turn,
          } as Projectile;

          if (projectileType === "bomb" || projectileType === "basic") {
            newEntities.push(projectile);
          } else if (projectileType === "diag_cross") {
            orderedDirections.forEach((facing, idx) => {
              const diagFacing =
                orderedDirections[(idx + 1) % orderedDirections.length];
              const position = getNextPosition(
                facing,
                entity.position,
                currentState,
                diagFacing,
              );

              if (!isSamePosition(position, entity.position)) {
                newEntities.push({
                  ...projectile,
                  id: projectile.id + `-${idx + 1}`,
                  position,
                  facing,
                  diagFacing,
                });
              }
            });
          } else if (projectileType === "spread") {
            const dirIdx = orderedDirections.indexOf(projectile.facing);

            newEntities.push({ ...projectile });

            [dirIdx - 1, dirIdx + 1].forEach((dir, idx) => {
              const diagFacing =
                orderedDirections[
                  // Add length to prevent negative number
                  (orderedDirections.length + dir) % orderedDirections.length
                ];
              const position = getNextPosition(
                projectile.facing,
                entity.position,
                currentState,
                diagFacing,
              );

              if (!isSamePosition(position, projectile.position)) {
                newEntities.push({
                  ...projectile,
                  id: projectile.id + `-${idx + 1}`,
                  position,
                  diagFacing,
                });
              }
            });
          }

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
      // const newEntityTypes = newEntities
      //   .filter((e) => e.type != "wall")
      //   .reduce((newEntities: Entity["type"][], entity) => {
      //     newEntities.push(entity.type);
      //     return newEntities;
      //   }, []);
      // console.log({ newEntityTypes });

      return newEntities;
    }, []),
  };
}

function tick(game: GameState): GameState {
  const { entities, map, turnCount, ...rest } = game;

  // Build up a "linearized" map of where everything is to make
  // collision detection a constant-time lookup
  const positionsMap = new Map<number, Entity>();
  function positionToIndex(p: Position) {
    return p[0] * map.width + p[1];
  }

  function asplodeBomb(position: Position, bomb: Projectile) {
    function handleSlot(slot: Position) {
      const pos = positionToIndex(slot);
      const thing = positionsMap.get(pos);
      if (thing?.type === "wall") return;

      positionsMap.set(pos, {
        ...bomb,
        position: slot,
        projectileType: "asplode",
        birthTurn: turnCount,
        id: `${bomb.id}-asplode-${pos}`,
      });
    }

    for (const x of [...Array(game.map.width).keys()]) {
      handleSlot([x, position[1]]);
    }

    for (const y of [...Array(game.map.height).keys()]) {
      handleSlot([position[0], y]);
    }
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
      const { facing, position, diagFacing, birthTurn, projectileType } =
        projectile;
      let nextPosition;

      if (projectileType === "bomb") {
        if (turnCount - birthTurn > BOMB_TIME) {
          asplodeBomb(position, projectile);
        } else {
          nextPosition = [...position] as Position;
        }
      } else if (projectileType === "asplode") {
        // only lasts a turn, clear it
        return;
      } else if (birthTurn >= turnCount) {
        // ALREADY MOVED
        nextPosition = position;
      } else {
        // Move the thing
        if (diagFacing) {
          nextPosition = getNextPosition(facing, position, game, diagFacing);
        } else {
          nextPosition = getNextPosition(facing, position, game);
        }

        // If projectile hits a boundary and cannot move, it must go away
        if (isSamePosition(nextPosition, position)) return;
      }

      if (!nextPosition) return;

      // Put projectile in hashmap, checking for projectile <=> projectile collisions
      const positionIdx = positionToIndex(nextPosition);

      if (positionsMap.has(positionIdx)) {
        // collision -- goodbye to both
        const other = positionsMap.get(positionIdx);
        if (other?.type === "projectile" && other.projectileType === "bomb") {
          positionsMap.delete(positionIdx);
          asplodeBomb(nextPosition, other);
        }
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
    turnCount: turnCount + 1,
    // convert map back to a list
    entities: [...positionsMap.values()],
    ...rest,
  };
}

export function progressGame(
  game: GameState,
  actions: ActionPayload[],
  desiredTurnCount: number,
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
    | undefined = undefined,
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
