package main

import (
	"log"
	"net/http"

	"github.com/olahol/melody"
)

type Game struct {
	m                *melody.Melody
	currentBeat      int
	currentBeatActed map[PlayerId]bool
}

func (g Game) New() Game {
	g.currentBeat = 0
	g.currentBeatActed = make(map[PlayerId]bool)
	return g
}

func (g *Game) Tick() {
	sessions, err := g.m.Sessions()
	if err != nil {
		panic(err)
	}

	for _, session := range sessions {
		pid := session.MustGet("pid").(PlayerId)
		if !g.currentBeatActed[pid] {
			PayloadTurn{
				currentBeat: g.currentBeat,
				action:      ActionSkip,
			}.Broadcast(g.m, pid)
		}
	}
	g.currentBeat += 1
	g.currentBeatActed = make(map[PlayerId]bool)
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
			if turn.currentBeat > game.currentBeat {
				game.Tick()
			}
			if turn.currentBeat == game.currentBeat {
				s.Set("currentTurnMsg", msg)
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
