import React from "react";
import type { GameState } from "./types";
import Board from "./components/Board/Board";
import useWebsocket from "./useWebsocket";

function App() {
	const [connected, send] = useWebsocket();

	if (!connected) {
		return <div>connecting...</div>;
	}

	const gameState: GameState = {
		map: {
			height: 10,
			width: 10,
		},
		entities: [
			{
				type: "player",
				id: "1",
				position: [2, 2],
				facing: "down",
			},
			{
				type: "player",
				id: "2",
				position: [9, 9],
				facing: "up",
			},
			// {
			//   type: "fireball",
			//   owner: "1",
			//   position: [3, 3],
			//   facing: "up",
			// },
		],
	};

	return (
		<>
			<button
				onClick={() => {
					send(
						JSON.stringify({
							playerId: "1",
							turnCount: 0,
							action: "moveLeft",
							checksum: "abc123",
						}),
					);
				}}
			>
				Send
			</button>
			<Board gameState={gameState} />
		</>
	);
}

export default App;
