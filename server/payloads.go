package main

import (
	"strconv"
	"strings"
)

func recievePayload(pid PlayerId, msg string) Payload {
	attr := strings.Split(msg, ":")

	msgType := attr[0]
	msgPayload := attr[1:]

	switch msgType {
	case "start":
		return PayloadStart{}.Recieve(pid, msgPayload)
	case "action":
		return PayloadAction{}.Recieve(pid, msgPayload)
	default:
		panic("unknown payload type")
	}
}

type Payload interface {
	Recieve(PlayerId, []string) Payload
	Send() string
}

// PayloadStart

type PayloadStart struct {
	you  string
	them []string
	when string
}

func (PayloadStart) Recieve(_ PlayerId, _ []string) Payload {
	return PayloadStart{}
}

func (p PayloadStart) Send() string {
	return strings.Join([]string{
		"start",
		p.you,
		strings.Join(p.them, ","),
		p.when,
	}, ":")
}

// PayloadAction

type PayloadAction struct {
	pid       PlayerId
	turnCount int
	action    string
}

func (PayloadAction) Recieve(pid PlayerId, attr []string) Payload {
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

func (p PayloadAction) Send() string {
	return strings.Join([]string{
		"action",
		string(p.pid),
		strconv.Itoa(p.turnCount),
		p.action,
	}, ":")
}
