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
    this.onAuth = (participant) => {
      this.participants[participant.id] = participant
    }
  }

  getSocketGroup(roomId) {
    return this.socketGroupsByRoomId[roomId]
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

  async addSocket(socket, req) {
    const participant = new Participant(socket, req, this.heartbeatTimeoutMillis)
    socket.participant = participant
    console.log("Initializing paritipcant")
    // this.participants[participant.id] = participant
    participant.setAuthHandler(this.onAuth)
    participant.setEventHandler(this.onEventReceived)
    console.log("Set event handler")
    socket.on('close', () => (this.removeParticipant(participant)))
    // log.dev.debug(`New client - ${participant.id}`)
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
