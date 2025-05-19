package main

import (
	"log"
	"net/http"

	"github.com/olahol/melody"
)

type Game struct {
	m             *melody.Melody
	beatIndex     int
	actedThisBeat map[PlayerId]bool
}

func (g Game) New() Game {
	g.beatIndex = 0
	g.actedThisBeat = make(map[PlayerId]bool)
	return g
}

// next beat happened! server moves game forward one tick and fills in missing payloads
func (g *Game) BroadcastMissing() {
	sessions, err := g.m.Sessions()
	if err != nil {
		panic(err)
	}

	for _, session := range sessions {
		pid := session.MustGet("pid").(PlayerId)
		if !g.actedThisBeat[pid] {
			PayloadAction{
				beatIndex: g.beatIndex,
				action:    ActionSkip,
			}.Broadcast(g.m, pid)
		}
	}
}

func main() {
	m := melody.New()
	game := Game{m: m}.New()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	m.HandleConnect(func(s *melody.Session) {
		pid := GeneratePlayerId()
		s.Set("pid", pid)
		m.Broadcast([]byte(pid))
	})

	//
	//  p1: M   M   M   M   M
	//  p2: M   M   s   s	M
	//
	// player makes move (send message)
	// server receives message -> m.HandleMessage
	// 	if player turn is ahead of game turn, call BroadcastMissing() which has all other players broadcast a skip move
	// 	if player turn is on game turn, set actedThisBeat and broadcast move to other players
	//  broadcast move to other players so they're at most 1 turn behind

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		pid := s.MustGet("pid").(PlayerId)
		payload := newPayload(string(msg))

		switch turn := payload.(type) {
		case PayloadAction:
			if turn.beatIndex > game.beatIndex {
				game.BroadcastMissing()
				game.actedThisBeat = make(map[PlayerId]bool)
				game.beatIndex += 1
			}
			if turn.beatIndex == game.beatIndex {
				game.actedThisBeat[pid] = true
				turn.Broadcast(m, pid)
			}
		}
	})

	const PORT = ":5174"
	log.Println("Server started on localhost" + PORT)
	if err := http.ListenAndServe(PORT, nil); err != nil {
		log.Fatal(err)
	}
}
