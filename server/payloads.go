package main

import (
	"log"
	"strconv"
	"strings"
)

func receivePayload(pid PlayerId, msg string) Payload {
	attr := strings.Split(msg, ":")

	msgType := attr[0]
	msgPayload := attr[1:]

	log.Println(msgType, msgPayload)

	switch msgType {
	case "start":
		return PayloadStart{}.Receive(pid, msgPayload)
	case "action":
		return PayloadAction{}.Receive(pid, msgPayload)
	default:
		panic("unknown payload type")
	}
}

type Payload interface {
	Receive(PlayerId, []string) Payload
	Send() string
}

// PayloadStart

type PayloadStart struct {
	you  string
	them []string
	when string
}

func (PayloadStart) Receive(_ PlayerId, _ []string) Payload {
	return PayloadStart{}
}

func (p PayloadStart) Send() string {
	them := strings.Join(p.them, ",")

	return strings.Join([]string{
		"start",
		p.you,
		them,
		p.when,
	}, ":")
}

// PayloadAction

type PayloadAction struct {
	pid       PlayerId
	turnCount int
	action    string
}

func (PayloadAction) Receive(pid PlayerId, attr []string) Payload {
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
