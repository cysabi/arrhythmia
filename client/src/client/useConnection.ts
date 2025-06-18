import React, { useCallback, type ActionDispatch } from "react";
import type { Action } from "../types";
import type { ClientEvent } from "./useGameState";

const useConnection = (dispatch: ActionDispatch<[client: ClientEvent]>) => {
  const onMessage = useCallback(
    (data: string) => {
      const payload = data.split(":");
      const type = payload.shift()!;

      switch (type) {
        case "start": {
          const playerId = payload.shift()!;
          const peerIds = payload.shift()!.split(",");
          const startAt = Date.parse(payload.shift()!);
          // TODO: try to use performance instead for precision/clock sync
          dispatch({
            type: "RECEIVED_START",
            payload: { playerId, peerIds, startAt },
          });
          break;
        }

        case "action": {
          const playerId = payload.shift()!;
          const turnCount = parseInt(payload.shift()!);
          const action = payload.shift()! as Action;
          dispatch({
            type: "RECEIVED_ACTION",
            payload: { playerId, turnCount, action },
          });
          break;
        }
      }
    },
    [dispatch]
  );

  return useRawConnection(onMessage);
};

const useRawConnection = (
  onMessage: (data: string) => void
): [boolean, WebSocket["send"]] => {
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
      onMessage(event.data);
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
    return [
      connected,
      (data) => console.error("not connected! send is fallthrough", data),
    ];
  }
  return [connected, (data) => ws.current!.send(data)];
};

export default useConnection;
