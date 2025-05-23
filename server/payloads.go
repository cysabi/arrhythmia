package main

import (
	"strconv"
	"strings"
)

type Payload interface {
	New(PlayerId, []string) Payload
	String() string
}

func makePayload(pid PlayerId, msg string) Payload {
	attr := strings.Split(msg, ":")

	msgType := attr[0]
	msgPayload := attr[1:]

	switch msgType {
	case "start":
		return PayloadStart{}.New(pid, msgPayload)
	case "action":
		return PayloadAction{}.New(pid, msgPayload)
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
	action    string
}

func (PayloadAction) New(pid PlayerId, attr []string) Payload {
	turnCount, err := strconv.Atoi(attr[0])
	if err != nil {
		panic(err)
	}
	action := attr[1]

	return PayloadAction{
		pid:       pid,
		turnCount: turnCount,
		action:    action,
	}
}

func (p PayloadAction) String() string {
	return strings.Join([]string{
		"action",
		string(p.pid),
		strconv.Itoa(p.turnCount),
		p.action,
	}, ":")
}
