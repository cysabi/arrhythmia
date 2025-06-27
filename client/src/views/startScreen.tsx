import { useState, useEffect } from "react";
import styles from "./views.module.css";
import hemmetcolor from "/hemmetcolor.svg";
import binkicolor from "/binkicolor.svg";
import skull from "/skull.svg";
import type { ClientState } from "../client/useGameState";
import type useClient from "../client/useClient";

export const StartScreen = ({
  status,
  send,
}: {
  status: ReturnType<typeof useClient>["status"];
  send: WebSocket["send"];
}) => {
  return (
    <div
      className={`flex flex-col gap-36 py-36 justify-between items-center w-[100svw] h-[100svh] ${styles.Background}`}
    >
      <Title />
      <div className="flex flex-col flex-1 gap-4 w-[800px] text-2xl font-semibold">
        {status.state === "error" && (
          <div className="text-center">something went wrong!</div>
        )}
        {status.state === "connecting" && (
          <div className="text-center">connecting...</div>
        )}
        {(status.state === "lobbies" || status.state === "starting") && (
          <Lobbies
            lobbies={status.lobbies}
            me={status.playerId}
            send={send}
            starting={status.state === "starting"}
          />
        )}
      </div>
    </div>
  );
};

const Title = () => {
  const [playerVisible, setPlayerVisible] = useState(true);
  useEffect(() => {
    let timeoutId: number;

    const loop = () => {
      setPlayerVisible(true);
      timeoutId = setTimeout(() => {
        setPlayerVisible(false);
        timeoutId = setTimeout(loop, 1000);
      }, 2000);
    };

    loop();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`flex justify-center h-36 gap-10 ${styles.Bounce}`}>
      <img src={playerVisible ? hemmetcolor : skull} className="w-40 h-40" />
      <div className={`translate-y-6 ${styles.Title}`}>ARRHYTHMIA</div>
      <img src={playerVisible ? binkicolor : skull} className="w-40 h-40" />
    </div>
  );
};

const Lobbies = ({
  lobbies,
  me,
  send,
  starting = false,
}: {
  lobbies: ClientState["lobbies"];
  me: string;
  send: WebSocket["send"];
  starting: boolean;
}) => {
  const [hovered, setHovered] = useState("");

  return lobbies.map((lobby) => {
    const joined = lobby.playerIds.includes(me);

    if (starting && !joined) {
      return <></>;
    }

    return (
      <button
        key={lobby.id}
        className={`flex flex-col justify-between border-4 p-3 gap-4 hover:border-[#365dbf] ${starting ? "cursor-wait bg-[#365dbf]/25" : "cursor-pointer"} ${joined ? "border-[#b152a0]" : "border-[#808080]"}`}
        onClick={() => {
          if (!joined) {
            send(["join", lobby.id].join(";"));
          } else if (!starting) {
            send("start");
          }
        }}
        onMouseEnter={() => setHovered(lobby.id)}
        onMouseLeave={() => setHovered("")}
      >
        <div className="text-left">
          {hovered === lobby.id ? (
            <div className="text-[#365dbf] uppercase font-black tracking-wide">
              {!joined ? "JOIN?" : starting ? "STARTING..." : "START!"}
            </div>
          ) : (
            <div className="lowercase">LOBBY {lobby.id}</div>
          )}
        </div>
        <div className="flex-1 flex text-xl text-left">
          {lobby.playerIds.map((playerId, i) => {
            return (
              <span key={lobby.id + "_" + playerId}>
                <span className="text-[#808080]">{i ? ", " : ""}</span>
                <span className={playerId === me ? "text-[#b152a0]" : ""}>
                  {playerId}
                </span>
              </span>
            );
          })}
        </div>
      </button>
    );
  });
};
