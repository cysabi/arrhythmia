package main

import (
	"fmt"
	"sync/atomic"
)

type PlayerId string

var pidCounter atomic.Uint64

func GeneratePlayerId() PlayerId {
	pidCounter.Add(1)
	return PlayerId(fmt.Sprintf("player-%d", pidCounter.Load()))
}
