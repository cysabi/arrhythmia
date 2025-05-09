import type { Action } from "../types";

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

export function applyTurns(
	turns: TurnPayload[],
	currentState?: GameState,
): GameState {}

export function progressTurn(
	turns: TurnPayload[],
	currentState?: GameState,
): GameState {
	// TODO: moving projectiles
	// TODO: prevent collisions w/ walls?
}
