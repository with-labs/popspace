const Participant = require("./participant")

class Participants {
  constructor(heartbeatTimeoutMillis) {
    this.heartbeatTimeoutMillis = heartbeatTimeoutMillis
    this.participants = {}
    this.socketGroupsByRoomId = {}
    this.onEventReceived = (event) => {
      if(this.eventHandler) {
        this.eventHandler(event)
      }
    }
  }

  getSocketGroup(roomId) {
    return this.socketGroupsByRoomId[roomId]
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
      this.socketGroupsByRoomId[roomId] = new lib.SocketGroup(participant.room)
    }
    await participant.joinSocketGroup(this.socketGroupsByRoomId[roomId])
  }

  addSocket(socket) {
    const participant = new Participant(socket, this.heartbeatTimeoutMillis)
    socket.participant = participant
    this.participants[participant.id] = participant
    participant.setEventHandler(this.onEventReceived)
    socket.on('close', () => (this.removeParticipant(participant)))
    log.dev.debug(`New client - ${participant.id}`)

    lib.analytics.participantCountChanged(Object.keys(this.participants).length)
  }

  removeParticipant(participant) {
    delete this.participants[participant.id]
    const promise = participant.disconnect()
    lib.analytics.participantCountChanged(Object.keys(this.participants).length)
    return promise
  }

  async disconnectAll() {
    return Promise.all(
      Object.values(this.participants).map((p) => (this.removeParticipant(p)))
    )
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
