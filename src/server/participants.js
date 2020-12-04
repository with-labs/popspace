const Participant = require("./participant")

class Sockets {
  constructor() {
    this.participants = {}
    this.onMessageReceived = (participant, message) => {
      if(this.messageHandler) {
        this.messageHandler(participant, message)
      }
    }
    this.onEventReceived = (participant, event) => {
      if(this.eventHandler) {
        this.eventHandler(participant, event)
      }
    }
  }

  setMessageHandler(messageHandler) {
    this.messageHandler = messageHandler
  }

  setEventHandler(eventHandler) {
    this.eventHandler = eventHandler
  }

  addSocket(socket) {
    const participant = new Participant(socket)
    socket.participant = participant
    this.participants[participant.id] = participant
    participant.setMessageHandler(this.onMessageReceived)
    participant.setEventHandler(this.onEventReceived)
    socket.on('close', () => (this.removeParticipant(participant)))
    log.dev.debug(`New client - ${participant.id}`)
  }

  removeParticipant(participant) {
    delete this.participants[participant.id]
  }

  rebroadcast(event) {
    return this.broadcastFrom(event._sender, event._message)
  }

  broadcastFrom(sendingParticipant, message) {
    this.list().forEach((participant) => {
      if(participant != sendingParticipant) {
        participant.send(message)
      }
    })
  }

  broadcastJsonFrom(json) {
    return this.broadcastFrom(JSON.stringify(json))
  }

  broadcastJson(json) {
    // Do we want to include generic meta-info, like the author of the message?
    return this.broadcast(JSON.stringify(json))
  }

  broadcast(message) {
    this.list().forEach((participant) => {
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

  list() {
    return Object.values(this.participants)
  }

  count() {
    return this.list().length
  }

  async serialize() {
    return this.list().map((p) => (p.serialize()))
  }
}

module.exports = Sockets
