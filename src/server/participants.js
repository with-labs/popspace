const Participant = require("./participant")
const SocketGroup = require("./socket_group")

class Participants {
  constructor() {
    this.participants = {}
    this.socketGroupsByRoomId = {}
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
    if(!this.socketGroupsByRoomId[roomId]) {
      this.socketGroupsByRoomId[roomId] = new SocketGroup(participant.room)
    }
    participant.joinSocketGroup(this.socketGroupsByRoomId[roomId])
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
    participant.disconnect()
  }

  async disconnectAll() {
    return Object.values(this.participants).forEach((p) => (this.removeParticipant(p)))
  }

  count() {
    return Object.values(this.participants).length
  }

  async participantsInRoom(roomId) {
    const socketGroup = this.socketGroupsByRoomId[roomId]
    return socketGroup ? socketGroup.participants() : []
  }

  async serialize(roomId) {
    return this.participantsInRoom(roomId).map((p) => (p.serialize()))
  }
}

module.exports = Participants
