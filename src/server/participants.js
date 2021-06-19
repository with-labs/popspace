const Participant = require("./participant")
const AsyncLock = require('async-lock')
const lock = new AsyncLock();

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
    /*
      NOTE: This lock is here to deal with a race condition.

      Why is there a race condition?

      Because we'd like to assign a participant to each connecting socket,
      and assigning a participant is an I/O operation, since we need to track
      participants in the database (otherwise, the ID sequence resets each time the server restarts).

      In Node.js, I/O operations like database writes are done on separate threads.
      This implies that the HTTP UPGRADE request to create the socket will return
      before the participant is created in the database.

      This is one of many possible solutions to this race condition problem: as
      socket connections are established and we wait on the database to finish setting
      the socket up, the client may start sending messages before we are ready to
      process them.

      Let's call the "get a participant ID from the database" step the init step.
      Here are the steps taken to prevent the race condition:

      1. We only let clients in and out one at a time; other clients have to wait for the current one to get in
      2. In the auth step - which should be the first message a client sends - we wait for the init step
      3. As we're registering the client `participents``, we also wait for the init step

      This takes care of the following concerns:
      1. A client sends the auth message before the socket is fully initialized with a participant
      2. If the server attempts to shut down before a client is fully initilized, that initialization will be allowed to
         finish before the participants start getting disconnected


      There are of course other possible solutions, and we can optimize as we move forward.
    */

    await lock.acquire("change_participants", async () => {
      await this.awaitParticipantsChange()
      this.addingParticipant = new Promise(async (resolve, reject) => {
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

        resolve()
      })
    })
  }

  async removeParticipant(participant) {
    await lock.acquire("change_participants", async () => {
      await this.awaitParticipantsChange()

      delete this.participants[participant.id]
      const promise = participant.disconnect()
      lib.analytics.participantCountChanged(Object.keys(this.participants).length)
      return promise
    })
  }

  async awaitParticipantsChange() {
    if(this.addingParticipant) {
      await this.addingParticipant
      this.addingParticipant = null
    }
  }


  async disconnectAll() {
    await this.awaitParticipantsChange()
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
