package main

import (
	"github.com/olahol/melody"
)

type Lobby struct {
	id         string
	player_ids []string
	joinable   bool
	game       Game
}

func (l Lobby) New(w WaitingRoom) Lobby {
	var lobby_id string
	for _, c := range "ABCDEFGHIJKLMNOPQRSTUVWXYZ" {
		_, has_key := w.lobbies[string(c)]
		if !has_key {
			lobby_id = string(c)
			break
		}
	}

	return Lobby{
		id:         lobby_id,
		player_ids: []string{},
		joinable:   true,
		game:       Game{}.New(),
	}
}

func (l Lobby) Sessions(m *melody.Melody) []*melody.Session {
	all_seshs, _ := m.Sessions()
	sessions := make([]*melody.Session, len(l.player_ids))

	for _, s := range all_seshs {
		session_pid := string(s.MustGet("pid").(PlayerId))

		for i, lobby_pid := range l.player_ids {
			if session_pid == lobby_pid {
				sessions[i] = s
			}
		}
	}

	return sessions
}

type WaitingRoom struct {
	lobbies map[string]Lobby
}

func (w WaitingRoom) New() WaitingRoom {
	w = WaitingRoom{
		lobbies: make(map[string]Lobby),
	}

	lobby := Lobby{}.New(w)
	w.lobbies[lobby.id] = lobby

	return w
}

func (w WaitingRoom) CleanLobbies() {
	for k, v := range w.lobbies {
		if len(v.player_ids) == 0 {
			delete(w.lobbies, k)
		}
	}

	lobby := Lobby{}.New(w)
	w.lobbies[lobby.id] = lobby
}

func (w WaitingRoom) AssignPlayer(pid PlayerId, lobby_id string) {
	lobby := w.lobbies[lobby_id]
	lobby.player_ids = append(lobby.player_ids, string(pid))
	w.lobbies[lobby_id] = lobby
	w.CleanLobbies()
}

func (w WaitingRoom) DesignPlayer(pid PlayerId) {
	lobby := w.LobbyForPlayer(pid)

	for i, v := range lobby.player_ids {
		if v == string(pid) {
			lobby.player_ids = append(lobby.player_ids[:i], lobby.player_ids[i+1:]...)
			w.lobbies[lobby.id] = lobby
		}
	}
}

func (w WaitingRoom) LobbyForPlayer(pid PlayerId) Lobby {
	for _, l := range w.lobbies {
		for _, s := range l.player_ids {
			if s == string(pid) {
				return l
			}
		}
	}
	return Lobby{} // TODO: better error case
}

func (w WaitingRoom) Start(pid PlayerId) {
	lobby := w.LobbyForPlayer(pid)
	lobby.joinable = false
	lobby.game = lobby.game.New()
	w.lobbies[lobby.id] = lobby
}

func (w WaitingRoom) Payload() PayloadLobbies {
	lobbies := []Lobby{}
	for _, v := range w.lobbies {
		if v.joinable {
			lobbies = append(lobbies, v)
		}
	}

	return PayloadLobbies{
		lobbies: lobbies,
	}
}
