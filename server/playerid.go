package main

import (
	"fmt"
	"sync/atomic"
)

var pidCounter atomic.Uint64

type PlayerId string

func PidGenerate() PlayerId {
	pidCounter.Add(1)
	return PlayerId(fmt.Sprintf("player_%d", pidCounter.Load()))
}

func PidReset() {
	pidCounter.Store(100)
}
