const Participant = require("./participant")

class Participants {
  constructor() {
    this.participants = {}
    this.roomParticipants = {}
    this.onEventReceived = (event) => {
      if(this.eventHandler) {
        this.eventHandler(event)
      }
    }
  }

  setMessageHandler(messageHandler) {
    this.messageHandler = messageHandler
  }

  setEventHandler(eventHandler) {
    this.eventHandler = eventHandler
  }

  async joinRoom(participant) {
    const roomId = participant.roomId()
    if(this.roomParticipants[roomId]) {
      this.roomParticipants[roomId].push(participant)
    } else {
      this.roomParticipants[roomId] = [participant]
    }
  }

  async quitRoom(participant) {
    const roomParticipants = this.getRoomParticipants(participant.roomId())
    if(!roomParticipants) {
      return
    }
    const index = roomParticipants.find((p) => (p == participant))
    if(index > -1) {
      roomParticipants.splice(index, 1)
    }
  }

  addSocket(socket) {
    const participant = new Participant(socket)
    socket.participant = participant
    this.participants[participant.id] = participant
    participant.setEventHandler(this.onEventReceived)
    socket.on('close', () => (this.removeParticipant(participant)))
    log.dev.debug(`New client - ${participant.id}`)
  }

  removeParticipant(participant) {
    delete this.participants[participant.id]
    this.quitRoom(participant)
  }

  rebroadcast(event) {
    return this.broadcastFrom(event._sender, event._message)
  }

  broadcastFrom(sendingParticipant, message) {

    this.getRoomParticipants(sendingParticipant.roomId()).forEach((participant) => {
      if(participant != sendingParticipant) {
        participant.send(message)
      }
    })
  }

  broadcastEvent(event) {
    return this.broadcastJson(event.serialize())
  }

  broadcastEventFrom(sendingParticipant, event) {
    return this.broadcastJsonFrom(sendingParticipant, event.serialize())
  }

  broadcastJsonFrom(sendingParticipant, json) {
    return this.broadcastFrom(sendingParticipant, JSON.stringify(json))
  }

  broadcastJson(json) {
    // Do we want to include generic meta-info, like the author of the message?
    return this.broadcast(JSON.stringify(json))
  }

  broadcast(roomId, message) {
    this.getRoomParticipants(roomId).forEach((participant) => {
      participant.send(message)
    })
  }

  async disconnectOne(participant) {
    this.removeParticipant(participant)
    return participant.disconnect()
  }

  async disconnectAll() {
    return this.list().forEach((p) => (this.disconnectOne(p)))
  }

  getRoomParticipants(roomId) {
    return this.roomParticipants[roomId] ? this.roomParticipants[roomId] : this.roomParticipants[roomId] = []
  }

  list() {
    return Object.values(this.participants)
  }

  count() {
    return this.list().length
  }

  async serialize(roomId) {
    return this.getRoomParticipants(roomId).map((p) => (p.serialize()))
  }
}

module.exports = Participants
