import { useState, useEffect } from "react";
import styles from "./views.module.css";
import hemmetcolor from "/hemmetcolor.svg";
import binkicolor from "/binkicolor.svg";
import skull from "/skull.svg";
import type { ClientState } from "../client/useGameState";

export const StartScreen = ({
  status,
  lobbies,
  me,
  send,
}: {
  status: "scheduled" | "idle";
  lobbies: ClientState["lobbies"];
  me: string;
  send: WebSocket["send"];
}) => {
  return (
    <div
      className={`flex justify-center items-center w-screen h-screen ${styles.Background}`}
    >
      <div className="flex flex-col items-center gap-12">
        <Title />
        {status && <Lobbies lobbies={lobbies} me={me} send={send} />}
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
}: {
  lobbies: ClientState["lobbies"];
  me: string;
  send: WebSocket["send"];
}) => {
  const [hovered, setHovered] = useState("");

  return (
    <div className="flex flex-col gap-4 w-[800px] text-2xl font-semibold">
      {lobbies.map((lobby) => {
        const joined = lobby.playerIds.includes(me);
        return (
          <button
            key={lobby.id}
            className={`flex flex-col justify-between border-4 p-3 gap-4 cursor-pointer hover:border-[#365dbf] ${joined ? "border-[#b152a0]" : "border-[#808080]"}`}
            onClick={() => {
              if (!joined) {
                send(["join", lobby.id].join(";"));
              } else {
                send("start");
              }
            }}
            onMouseEnter={() => setHovered(lobby.id)}
            onMouseLeave={() => setHovered("")}
          >
            <div className="text-left">
              {hovered === lobby.id ? (
                <div className="text-[#365dbf]">
                  {!joined ? "JOIN" : "START"}
                </div>
              ) : (
                <div>LOBBY {lobby.id}</div>
              )}
            </div>
            <div className="flex-1 flex text-xl text-left">
              {lobby.playerIds.map((playerId, i) => {
                return (
                  <span key={playerId}>
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
      })}
    </div>
  );
};
