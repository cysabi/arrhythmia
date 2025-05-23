package main

import (
	"log"
	"net/http"
	"strings"

	"slices"

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
		pid := session.MustGet("pid").(PlayerId)
		if !g.actedThisBeat[pid] {
			skipPayload := PayloadAction{
				pid:       pid,
				turnCount: g.turnCount,
				action:    "skip",
			}.String()
			m.Broadcast([]byte(skipPayload))
		}
	}
}

func BroadcastConnect(m *melody.Melody) {
	sessions, err := m.Sessions()
	if err != nil {
		panic(err)
	}

	pids := make([]string, len(sessions))
	for i, s := range sessions {
		pids[i] = string(s.MustGet("pid").(PlayerId))
	}

	for i, s := range sessions {
		others := strings.Join(slices.Delete(pids, i, i+1), ",")

		payload := PayloadYou{}.New(
			PlayerId(pids[i]),
			[]string{others})

		m.BroadcastMultiple([]byte(payload.String()), []*melody.Session{s})
	}
}

func main() {
	m := melody.New()
	game := Game{}.New()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	m.HandleConnect(func(s *melody.Session) {
		pid := GeneratePlayerId()
		s.Set("pid", pid)

		BroadcastConnect(m)
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

		pid := s.MustGet("pid").(PlayerId)
		switch payload := recievePayload(pid, string(msg)).(type) {

		case PayloadAction:
			if payload.turnCount > game.turnCount {
				game.BroadcastMissing(m)
				game.actedThisBeat = make(map[PlayerId]bool)
				game.turnCount += 1
			}
			if payload.turnCount == game.turnCount {
				game.actedThisBeat[pid] = true
				m.Broadcast([]byte(payload.String()))
			}

		case PayloadStart:
			m.Broadcast([]byte(payload.String()))

		}
	})

	const PORT = ":5174"
	log.Println("Server started on localhost" + PORT)
	if err := http.ListenAndServe(PORT, nil); err != nil {
		log.Fatal(err)
	}
}
