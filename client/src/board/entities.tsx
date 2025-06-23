import type { Player } from "../types";

export const Player1 = () => {
  return <img src="/binki.svg" alt="player1" />;
};

export const Player2 = () => {
  return <img src="/hemmet.svg" alt="player2" />;
};

export const Projectile = () => {
  return <img src="/trash.jpg" alt="A projectile" />;
};

export const Skull = () => {
  return <img src="/skull.svg" alt="skull" />;
};

export const Wall = () => {
  return <img src="/floor.svg" alt="wall" />;
};

export const getPlayerNumber = (playerId: Player["id"]): number => {
  return parseFloat(playerId.split("_")[1]) - 100; // why do player ids start at 100?
};

export const assignAvatarId = (playerId: Player["id"]): number => {
  // assign one of 2 avatars
  return getPlayerNumber(playerId) % 2;
};

export const getAvatar = (avatarId: number) => {
  return avatarId ? <Player1 /> : <Player2 />;
};
