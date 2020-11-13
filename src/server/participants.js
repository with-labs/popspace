const Participant = require("./participant")

class Sockets {
  constructor() {
    this.participants = {}
    this.onMessageReceived = (participant, message) => {
      if(this.messageHandler) {
        this.messageHandler(participant, message)
      }
    }
  }

  setMessageHandler(messageHandler) {
    this.messageHandler = messageHandler
  }

  addSocket(socket) {
    const participant = new Participant(socket)
    socket.participant = participant
    this.participants[participant.id] = participant
    participant.setMessageHandler(this.onMessageReceived)
    socket.on('close', () => (this.removeParticipant(socket)))
  }

  removeParticipant(participant) {
    delete this.participants[participant.id]
  }

  broadcastFrom(sendingParticipant, message) {
    this.list().forEach((participant) => {
      if(participant != sendingParticipant) {
        participant.send(message)
      }
    })
  }

  broadcast(message) {
    this.list().forEach((participant) => {
      participant.send(message)
    })
  }

  disconnectOne(participant) {
    participant.disconnect()
    this.removeParticipant(participant)
  }

  disconnectAll() {
    this.list().forEach((p) => (this.disconnectOne(p)))
  }

  list() {
    return Object.values(this.participants)
  }

  count() {
    return this.list().length
  }
}

module.exports = Sockets
