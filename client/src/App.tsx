import React from "react";
import Board from "./components/Board/Board";
import useWebsocket from "./useWebsocket";
import { sampleGameState } from "./util/game-logic";

function App() {
	const [connected, send] = useWebsocket();

	if (!connected) {
		return <div>connecting...</div>;
	}

	return (
		<div className="h-svh w-svw flex flex-col">
			<div>
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
			</div>
			<div className="flex-grow">
				<Board gameState={sampleGameState} />
			</div>
		</div>
	);
}

export default App;
