package main

import (
	"fmt"
	"log"
	"net/http"
	"sync/atomic"

	"github.com/olahol/melody"
)

type Action string
type PlayerId string

const (
	MoveUp    Action = "moveUp"
	MoveDown  Action = "moveDown"
	MoveLeft  Action = "moveLeft"
	MoveRight Action = "moveRight"
	Skip      Action = "skip"
	Shoot     Action = "shoot"
)

type TurnPayload struct {
	playerId PlayerId
	index    int
	action   string
	checksum string
}

type SessionPlayer struct {
	playerId           PlayerId
	lastValidTurnIndex int
}

type GameState struct {
	currentTurnIndex int
}

func main() {
	m := melody.New()

	gameState := GameState{}

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	m.HandleConnect(func(s *melody.Session) {
		s.Set("player", SessionPlayer{playerId: generatePid()})
	})

	// listenFor MovePayload
	m.HandleMessage(func(s *melody.Session, msg []byte) {

		msgType := "turn"
		switch msgType {
		case "turn":
			turn := TurnPayload{
				index:    0,
				action:   "moveLeft",
				checksum: "abc123",
			}

			if turn.index > gameState.currentTurnIndex {
				gameState.currentTurnIndex = turn.index
			}

			if turn.index < gameState.currentTurnIndex {
				// catchup payload
			} else if false { // todo checksum
				// catchup payload
			}

			m.BroadcastOthers(msg, s)

			// store just position of entities and their properties including players
			// on move, update board state
			// on recieve move, update board state
			// on checksum save snapshot of list
			// on rewind play from snapshot to
			// history of list of entities

			// turn := "0:moveLeft:abc123"

		}

		// ~ if higher move index
		// ~ ~ generate new checksum

		// ~ compare checksum
		// ~ ~ if invalid checksum : broadcast CatchupPayload
		// ~ ~ else : broadcast move to other player

	})

	log.Println("Server started on localhost" + PORT)

	if err := http.ListenAndServe(PORT, nil); err != nil {
		log.Fatal(err)
	}
}

const PORT = ":5174"

var pidCounter atomic.Uint64

func generatePid() PlayerId {
	pidCounter.Add(1)
	return PlayerId(fmt.Sprintf("player-%d", pidCounter.Load()))
}
