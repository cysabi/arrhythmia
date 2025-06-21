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
				action:    "skip",
			}.Send()
			m.Broadcast([]byte(skipPayload))
		}
	}
}

func main() {
	m := melody.New()
	game := Game{}.New()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	// TODO:
	// m.HandleDisconnect(func(s *melody.Session) {
	//
	// })

	m.HandleConnect(func(s *melody.Session) {

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

		key, exists := s.Get("pid")
		pid := PlayerId("")
		if exists {
			pid = key.(PlayerId)
		}
		switch payload := receivePayload(pid, string(msg)).(type) {

		case PayloadAction:
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
			sessions, _ := m.Sessions()

			// reset state
			PidReset()
			game = Game{}.New()

			// make pids
			pids := make([]string, m.Len())
			for i, session := range sessions {
				pid = PidGenerate()
				pids[i] = string(pid)
				session.Set("pid", pid)
			}

			// set when/them
			payload.when = fmt.Sprintf("%d",
				time.Now().Add(4*time.Second).UnixMilli())
			payload.them = pids

			// write with you
			for i, s := range sessions {
				payload.you = pids[i]
				s.Write([]byte(payload.Send()))
			}
		}
	})

	const PORT = ":5199"
	log.Println("Server started on localhost" + PORT)
	if err := http.ListenAndServe(PORT, nil); err != nil {
		log.Fatal(err)
	}
}
