import useClient from "./client/useClient";
import Board from "./board";

function App() {
  const view = useClient();

  return (
    <div className="h-svh w-svw flex flex-col">
      <div className="flex-grow">
        <Board gameState={view} />
      </div>
    </div>
  );
}

export default App;
