package main

import (
	"net/http"

	"github.com/olahol/melody"
)

func main() {
	m := melody.New()

	http.Handle("/", http.FileServer(http.Dir("../client/dist")))

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		m.HandleRequest(w, r)
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		m.Broadcast(msg)
	})

	http.ListenAndServe(":5000", nil)

	// i will be in person tomorrow YAY OK . MORNING. BEFORE 1??
	// ok !!
	// lets pair :D when ?SORRY U CAN GO I CAN TXT  OKOK BYEEE HAVE FUN
}
