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

func (g *Game) Tick() {
	sessions, err := g.m.Sessions()
	if err != nil {
		panic(err)
	}

	for _, session := range sessions {
		pid := session.MustGet("pid").(PlayerId)
		if !g.actedThisBeat[pid] {
			PayloadTurn{
				beatIndex: g.beatIndex,
				action:    ActionSkip,
			}.Broadcast(g.m, pid)
		}
	}
	g.beatIndex += 1
	g.actedThisBeat = make(map[PlayerId]bool)
}

func main() {
	m := melody.New()
	game := Game{m: m}.New()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	m.HandleConnect(func(s *melody.Session) {
		s.Set("pid", GeneratePlayerId())
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		pid := s.MustGet("pid").(PlayerId)
		payload := newPayload(string(msg))

		switch turn := payload.(type) {
		case PayloadTurn:
			if turn.beatIndex > game.beatIndex {
				game.Tick()
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
