package main

import (
	"strconv"
	"strings"

	"github.com/olahol/melody"
)

// pid:
type Payload interface {
	New([]string) Payload
}

func newPayload(raw string) Payload {
	attr := strings.Split(raw, ":")

	switch attr[0] {
	case "start":
		return PayloadStart{}.New(attr[1:])
	case "action":
		return PayloadAction{}.New(attr[1:])
	default:
		panic("unknown payload type")
	}
}

type PayloadStart struct{}

func (PayloadStart) New(attr []string) Payload {
	return PayloadStart{}
}

type PayloadAction struct {
	turnCount int
	action    Action
}

func (PayloadAction) New(attr []string) Payload {
	index, err := strconv.Atoi(attr[0])
	if err != nil {
		panic(err)
	}
	action, err := strconv.Atoi(attr[1])
	if err != nil {
		panic(err)
	}

	return PayloadAction{
		turnCount: index,
		action:    Action(action),
	}
}

// action:{pid}:{turnCount}:{action}
func (p PayloadAction) Broadcast(m *melody.Melody, pid PlayerId) {
	payload := strings.Join([]string{
		"action",
		string(pid),
		strconv.Itoa(p.turnCount),
		strconv.Itoa(int(p.action)),
	}, ":")

	m.Broadcast([]byte(payload))
}

type Action int

const (
	ActionSkip Action = iota
	ActionMoveUp
	ActionMoveDown
	ActionMoveLeft
	ActionMoveRight
	ActionShoot
)
