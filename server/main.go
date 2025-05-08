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

func main() {
	m := melody.New()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	// listenFor MovePayload
	m.HandleMessage(func(s *melody.Session, msg []byte) {
		// turn := TurnPayload{} // msg

		m.Broadcast(msg)

		// ~ if higher move index
		// ~ ~ generate new checksum

		// ~ compare checksum
		// ~ ~ if invalid checksum : broadcast CatchupPayload
		// ~ ~ else : broadcast move to other player

	})
	port := "5174"

	log.Println("Server started on localhost:" + port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
