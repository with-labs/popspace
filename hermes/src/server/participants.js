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
    participant.setEventHandler(this.onEventReceived)

    /*
      Still thinking about this.

      Perhaps it's easier to have in-memory hermesIds for participants,
      and key on those - for a single run of the server, that's all we need.

      For analytics, we'll use the datbase IDs - but writing to the DB
      can always wait for the first write to the DB with the participant ID.
    */
    await participant.awaitInit()
    this.participants[participant.id] = participant
    /*
      NOTE: this handler makes most sense after we've recorded the participant

      In principle a race condition is possible here where the participant leaves
      before the handler is assigned (either after it's recorded or before)...
    */
    socket.once('close', () => (this.removeParticipant(participant)))
    log.dev.debug(`New client - ${participant.id}`)
    lib.analytics.participantCountChanged(Object.keys(this.participants).length)
  }

  async removeParticipant(participant) {
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
