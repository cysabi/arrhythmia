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

type Lobby struct {
	id string
	player_ids []string
}
type WaitingRoom struct {
	lobbies	map[string]Lobby
}

func (w WaitingRoom) CleanLobbies() {
	for k,v := range w.lobbies {
		if len(v.player_ids) == 0 {
			delete(w.lobbies, k)
		}
	}				

	lobby_id := w.NextLobbyId()

	w.lobbies[lobby_id] = Lobby {
		id: lobby_id,
		player_ids: []string{},
	}
}

func (w WaitingRoom) NextLobbyId() string {
	for _, c := range "ABCDEFGHIJKLMNOPQRSTUVWXYZ" {
	  _, has_key := w.lobbies[string(c)]
		if !has_key {
		  return string(c)
		}
	}

	// TODO: better error handling
	return ""
}

func (w WaitingRoom) AssignPlayer(lobby_id string, pid PlayerId) {
  lobby := w.lobbies[lobby_id]
	lobby.player_ids = append(lobby.player_ids, string(pid))
	w.lobbies[lobby_id] = lobby
	w.CleanLobbies()
}

func (w WaitingRoom) LobbyForPlayer(pid PlayerId) Lobby {
	for _, l := range w.lobbies {
		for _, s := range l.player_ids {
				if s == string(pid) {
  				return l
				}
		}
	}

  // TODO: better error case
	return Lobby {}
}

func (w WaitingRoom) Start(pid PlayerId) {
	lobby := w.LobbyForPlayer(pid)
	delete(w.lobbies, lobby.id)
}

func (w WaitingRoom) LobbiesPayload() PayloadLobbies {
  lobbies := []Lobby{}
	for _, v := range w.lobbies {
		lobbies = append(lobbies, v)
	}

	return PayloadLobbies {
		lobbies: lobbies,
	}
}

func (w WaitingRoom) New() WaitingRoom {
	w = WaitingRoom {
		lobbies: make(map[string]Lobby),
	}

	lobby_id := "A"

	w.lobbies[lobby_id] = Lobby {
		id: lobby_id,
		player_ids: []string{},
	}

	return w
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
	game := Game{}.New()
	waiting_room := WaitingRoom{}.New()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	// TODO:
	// m.HandleDisconnect(func(s *melody.Session) {
	//
	// })

	m.HandleConnect(func(s *melody.Session) {
		// Assign player id
		// Send lobbies
		pid := PidGenerate()
		s.Set("pid", pid)

		s.Write([]byte(waiting_room.LobbiesPayload().Send()))
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
		switch payload := receivePayload(pid, string(msg)).(type) {

		case PayloadAction:
			// TODO: CY - only send to members of lobby
			for payload.turnCount > game.turnCount {
				game.BroadcastMissing(m)
				game.actedThisBeat = make(map[PlayerId]bool)
				game.turnCount += 1
			}
			if payload.turnCount == game.turnCount {
				game.actedThisBeat[pid] = true
				m.Broadcast([]byte(payload.Send()))
			}

		case PayloadStart:
			// TODO: CY - only send to members of lobby

			waiting_room.Start(pid);
			sessions, _ := m.Sessions()

			// reset state
			PidReset()
			game = Game{}.New()

			// make pids
			pids := make([]string, m.Len())
			for i, session := range sessions {
				pid, _ := session.Get("pid")
				pids[i] = string(pid.(PlayerId))
			}

			// set when/them
			payload.when = fmt.Sprintf("%d",
				time.Now().Add(2*time.Second).UnixMilli())
			payload.them = pids

			// write with you
			for i, s := range sessions {
				payload.you = pids[i]
				s.Write([]byte(payload.Send()))
			}

		case PayloadJoin:
			// TODO: CY - send this from the client!
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
