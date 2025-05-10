package main

import (
	"strconv"
	"strings"

	"github.com/olahol/melody"
)

type Payload interface {
	New([]string) Payload
}

func newPayload(raw string) Payload {
	attr := strings.Split(raw, ":")

	switch attr[0] {
	case "start":
		return PayloadStart{}.New(attr[1:])
	case "turn":
		return PayloadTurn{}.New(attr[1:])
	default:
		panic("unknown payload type")
	}
}

type PayloadStart struct{}

func (PayloadStart) New(attr []string) Payload {
	return PayloadStart{}
}

type PayloadTurn struct {
	currentBeat int
	action      TurnAction
}

func (p PayloadTurn) Broadcast(m *melody.Melody, pid PlayerId) {
	payload := strings.Join([]string{
		string(pid),
		strconv.Itoa(p.currentBeat),
		strconv.Itoa(int(p.action)),
	}, ":")

	m.Broadcast([]byte(payload))
}

func (PayloadTurn) New(attr []string) Payload {
	index, err := strconv.Atoi(attr[0])
	if err != nil {
		panic(err)
	}
	action, err := strconv.Atoi(attr[1])
	if err != nil {
		panic(err)
	}

	return PayloadTurn{
		currentBeat: index,
		action:      TurnAction(action),
	}
}

type TurnAction int

const (
	ActionSkip TurnAction = iota
	ActionMoveUp
	ActionMoveDown
	ActionMoveLeft
	ActionMoveRight
	ActionShoot
)
