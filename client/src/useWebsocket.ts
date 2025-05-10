import React from "react";

// the board is represented as a list of entities and components
// progressTurn loops over all types of components and applies effects
// THEN player moves happen after. if the player presses early (or opponent happens early) queue it to happen after
// otherwise apply moves on recieve
// save snapshot of board on recieve if

const useWebsocket = (): [false, null] | [true, WebSocket["send"]] => {
  let ws = React.useRef(null as WebSocket | null);

  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    ws.current = new WebSocket("ws://localhost:5174/ws");

    ws.current.addEventListener("open", () => {
      console.debug("ws::open");
      setConnected(true);
    });
    ws.current.addEventListener("close", () => {
      console.debug("ws::close");
      setConnected(false);
    });

    ws.current.addEventListener("message", (event) => {
      console.debug("ws::message", event);
      console.log(JSON.parse(event.data));
    });

    ws.current.addEventListener("error", (event) => {
      console.error("ws::error", event);
    });

    // clean up/close ws before calling next useEffect n making new connection
    return () => {
      ws.current!.close();
    };
  }, []); // triggers once

  if (!connected) {
    return [connected, null];
  }
  return [connected, (data) => ws.current!.send(data)];
};

export default useWebsocket;
