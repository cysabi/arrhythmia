package main

import (
	"strconv"
	"strings"
	"time"
)

type Payload interface {
	New(PlayerId, []string) Payload
	String() string
}

func recievePayload(pid PlayerId, msg string) Payload {
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

// PayloadYou
type PayloadYou struct {
	pid    PlayerId
	others []string
}

func (PayloadYou) New(pid PlayerId, attr []string) Payload {
	others := strings.Split(attr[0], ",")

	return PayloadYou{
		pid:    pid,
		others: others,
	}
}

func (p PayloadYou) String() string {
	return strings.Join([]string{
		"you",
		string(p.pid),
		strings.Join(p.others, ","),
	}, ":")
}

// PayloadStart
type PayloadStart struct {
	pid  PlayerId
	when string
}

func (PayloadStart) New(pid PlayerId, attr []string) Payload {
	now := time.Now()
	futureTime := now.Add(2 * time.Second)
	when := futureTime.Format("2006-01-02T15:04:05.999999Z07:00")

	return PayloadStart{
		pid:  pid,
		when: when,
	}
}

func (p PayloadStart) String() string {
	return strings.Join([]string{
		"start",
		p.when,
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
