package main

import (
	"log"
	"net/http"

	"github.com/olahol/melody"
)

type Action string

const (
	MoveUp    Action = "moveUp"
	MoveDown         = "moveDown"
	MoveLeft         = "moveLeft"
	MoveRight        = "moveRight"
	Skip             = "skip"
	Shoot            = "shoot"
)

type TurnPayload struct {
	playerId  string
	turnCount int
	action    string
	checksum  string
}

type GameState struct {
	turnHistory []TurnPayload
	players     []Player
	checksum    string
}

type Player struct {
	id            string
	lastValidTurn int
}

const PORT = ":5174"

func main() {
	m := melody.New()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	// listenFor MovePayload
	m.HandleMessage(func(s *melody.Session, msg []byte) {

		log.Println(string(msg))
		// turn := TurnPayload{} // msg

		m.Broadcast(msg)

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
