package main

import (
	"strconv"
	"strings"
)

type Payload interface {
	New(PlayerId, []string) Payload
	String() string
}

func makePayload(pid PlayerId, raw string) Payload {
	attr := strings.Split(raw, ":")

	switch attr[0] {
	case "start":
		return PayloadStart{}.New(pid, attr[1:])
	case "action":
		return PayloadAction{}.New(pid, attr[1:])
	default:
		panic("unknown payload type")
	}
}

// PayloadStart
type PayloadStart struct {
	pid PlayerId
}

func (PayloadStart) New(pid PlayerId, attr []string) Payload {
	return PayloadStart{
		pid: pid,
	}
}

func (p PayloadStart) String() string {
	return strings.Join([]string{
		"start",
		string(p.pid),
	}, ":")
}

// PayloadAction
type PayloadAction struct {
	pid       PlayerId
	turnCount int
	action    Action
}

func (PayloadAction) New(pid PlayerId, attr []string) Payload {
	index, err := strconv.Atoi(attr[0])
	if err != nil {
		panic(err)
	}
	action, err := strconv.Atoi(attr[1])
	if err != nil {
		panic(err)
	}

	return PayloadAction{
		pid:       pid,
		turnCount: index,
		action:    Action(action),
	}
}

func (p PayloadAction) String() string {
	return strings.Join([]string{
		"action",
		string(p.pid),
		strconv.Itoa(p.turnCount),
		strconv.Itoa(int(p.action)),
	}, ":")
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
