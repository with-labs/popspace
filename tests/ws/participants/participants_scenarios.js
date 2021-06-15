module.exports = {
  "participants_see_each_other": lib.test.template.nAuthenticatedActors(5, async (testEnvironment) => {
    const loggedInActors = testEnvironment.loggedInActors
    return {
      countsAtEnd: loggedInActors.filter((lu) => (lu != loggedInActors[0])).map((lu) => (lu.client.authenticatedPeers().length)),
      desiredParticipants: testEnvironment.loggedInActors.length
    }
  }),

  "disconnecting_participants": lib.test.template.nAuthenticatedActors(3, async (testEnvironment) => {
    const loggedInActors = testEnvironment.loggedInActors
    const participantCountAtStart = loggedInActors.length
    let remainingNotifications = participantCountAtStart - 1
    return new Promise(async (resolve, reject) => {
      loggedInActors.forEach((u) => {
        u.client.on("event.participantLeft", (event) => {
          remainingNotifications--
          if(remainingNotifications == 0) {
            /*
              We'll actually get some final notifications as hermes
              is shutting down - since we try to gracefuly disconect clients,
              which sends other clients participantLeft notifications.
              So compare == instead of <=
            */
            resolve({
              participantCountAtStart,
              countsAtEnd: loggedInActors.filter((lu) => (lu != loggedInActors[0])).map((lu) => (lu.client.authenticatedPeers().length))
            })
          }
        })
      })
      await loggedInActors[0].client.disconnect()
    })

  }),

  "moving_participants": lib.test.template.nAuthenticatedActors(3, async (testEnvironment) => {
    const loggedInActors = testEnvironment.loggedInActors
    const client = loggedInActors[0].client
    const beforeMove = loggedInActors[0].auth.stateInRoom
    const move = {
      roomState: {
        position: {
          x: 10,
          y: 10
        }
      }
    }
    const moveResult = await client.sendEventWithPromise("transformSelf", move)
    return {
      moveResult, beforeMove
    }
  }),


  "max_participants_respected": lib.test.template.nAuthenticatedActors(2, async (testEnvironment) => {
    const loggedInActors = testEnvironment.loggedInActors
    const maxParticipantsGetter = lib.SocketGroup.prototype.getMaxParticipants
    const mockActorLimit = 2
    lib.SocketGroup.prototype.getMaxParticipants = () => (mockActorLimit)
    const creatorInfo = testEnvironment.loggedInActors[0]

    const room = creatorInfo.room
    const rac = RoomActorClient.create()
    await rac.enableRoomAccess(room)
    try {
      await rac.initiateLoggedInSession()
      await rac.authenticateSocket()
    } catch (error) {
      return {
        error,
        mockActorLimit
      }
    } finally {
      lib.SocketGroup.prototype.getMaxParticipants = maxParticipantsGetter
    }

    return "No error"
  })

}
