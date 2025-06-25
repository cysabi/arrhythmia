import React, { useCallback, type ActionDispatch } from "react";
import type { Action, ProjectileType } from "../types";
import type { ClientEvent } from "./useGameState";

const useConnection = (dispatch: ActionDispatch<[client: ClientEvent]>) => {
  const onMessage = useCallback(
    (data: string) => {
      console.log({ payload: data.split(";") });

      const payload = data.split(";");
      const type = payload.shift()!;

      switch (type) {
        case "start": {
          const playerId = payload.shift()!;
          const peerIds = payload.shift()!.split(",");
          const startAt = parseInt(payload.shift()!);

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
          let projectileType;
          if (payload.length > 0) {
            projectileType = payload.shift() as ProjectileType;
          }
          dispatch({
            type: "RECEIVED_ACTION",
            payload: { playerId, turnCount, action, projectileType },
          });
          break;
        }
      }
    },
    [dispatch]
  );

  const [connected, send] = useRawConnection(onMessage);
  return { connected, send };
};

const useRawConnection = (onMessage: (data: string) => void) => {
  let ws = React.useRef(null as WebSocket | null);

  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    console.log("WS URL IS", import.meta.env.VITE_SERVER_WS_URL);
    ws.current = new WebSocket(import.meta.env.VITE_SERVER_WS_URL);

    ws.current.addEventListener("open", () => {
      console.debug({ ws: "open" });
      setConnected(true);
    });
    ws.current.addEventListener("close", () => {
      console.debug({ ws: "close" });
      setConnected(false);
    });

    ws.current.addEventListener("message", (event) => {
      console.debug({ ws: { message: event } });
      onMessage(event.data);
    });

    ws.current.addEventListener("error", (event) => {
      console.error({ ws: { error: event } });
    });

    // clean up/close ws before calling next useEffect n making new connection
    return () => {
      ws.current!.close();
    };
  }, []); // triggers once

  if (!connected) {
    return [
      connected,
      (data: string) =>
        console.error("not connected! send is fallthrough", data),
    ] as const;
  }
  return [connected, (data: string) => ws.current!.send(data)] as const;
};

export default useConnection;
