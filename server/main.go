package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/olahol/melody"
)

type Game struct {
	turnCount     int
	actedThisBeat map[PlayerId]bool
}

func (g Game) New() Game {
	g.turnCount = 0
	g.actedThisBeat = make(map[PlayerId]bool)
	return g
}

func (g *Game) BroadcastMissing(m *melody.Melody) {
	sessions, err := m.Sessions()
	if err != nil {
		panic(err)
	}

	for _, session := range sessions {
		got, exists := session.Get("pid")
		pid := got.(PlayerId)

		if !exists {
			continue
		}

		if !g.actedThisBeat[pid] {
			skipPayload := PayloadAction{
				pid:       pid,
				turnCount: g.turnCount,
				action:    []string{"skip"},
			}.Send()
			m.Broadcast([]byte(skipPayload))
		}
	}
}

func main() {
	m := melody.New()
	waiting_room := WaitingRoom{}.New()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	// TODO:
	m.HandleDisconnect(func(s *melody.Session) {
		pid := s.MustGet("pid").(PlayerId)
		waiting_room.LobbyForPlayer(pid)
	})

	m.HandleConnect(func(s *melody.Session) {
		// Assign player id
		// Send lobbies
		pid := PidGenerate()
		s.Set("pid", pid)

		s.Write([]byte(waiting_room.LobbiesPayload().Send()))
		s.Write([]byte("start;" + pid))
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		//
		//  p1: M   M   M   M   M
		//  p2: M   M   s   s
		//
		// player makes move (send message)
		// server receives message -> m.HandleMessage
		// 	if player turn is ahead of game turn, call BroadcastMissing() which has all other players broadcast a skip move
		// 	if player turn is on game turn, set actedThisBeat and broadcast move to other players
		//  broadcast move to other players so they're at most 1 turn behind

		key := s.MustGet("pid")
		pid := key.(PlayerId)
		lobby := waiting_room.LobbyForPlayer(pid)

		sessions_in_lobby = make([], PlayerId)
		for _, s := range sessions {
			session_p := s.MustGet("pid").(string)
			// for every session
			// check if the session pid ===
		}

		switch payload := receivePayload(pid, string(msg)).(type) {

		case PayloadAction:
			// TODO: CY - only send to members of lobby
			for payload.turnCount > lobby.game.turnCount {
				lobby.game.BroadcastMissing(m)
				lobby.game.actedThisBeat = make(map[PlayerId]bool)
				lobby.game.turnCount += 1
			}
			if payload.turnCount == lobby.game.turnCount {
				lobby.game.actedThisBeat[pid] = true
				m.Broadcast([]byte(payload.Send()))
			}

		case PayloadStart:
			// TODO: CY - only send to members of lobby

			waiting_room.Start(pid)
			sessions, _ := m.Sessions()

			// reset state
			lobby.game = Game{}.New()

			// set when/them
			payload.when = fmt.Sprintf("%d",
				time.Now().Add(2*time.Second).UnixMilli())
			payload.them = lobby.player_ids

			// write to lobby
			for _, s := range sessions {
				p := s.MustGet("pid").(string)

				for _, pp := range lobby.player_ids {
					if pp == p {
						payload.you = pp
						s.Write([]byte(payload.Send()))
					}
				}
			}

		case PayloadJoin:
			// broadcast entire waiting room
			waiting_room.AssignPlayer(payload.lobby_id, payload.player_id)
			m.Broadcast([]byte(waiting_room.LobbiesPayload().Send()))
		}
	})

	const PORT = ":5199"
	log.Println("Server started on localhost" + PORT)
	if err := http.ListenAndServe(PORT, nil); err != nil {
		log.Fatal(err)
	}
}
