global.tlib = require("../../../lib/_testlib")

module.exports = {
  "participants_see_each_other": tlib.TestTemplate.nAuthenticatedUsers(5, async (testEnvironment) => {
    const loggedInUsers = testEnvironment.loggedInUsers
    return {
      countsAtEnd: loggedInUsers.filter((lu) => (lu != loggedInUsers[0])).map((lu) => (lu.client.authenticatedPeers().length)),
      desiredParticipants: testEnvironment.loggedInUsers.length
    }
  }),

  "disconnecting_participants": tlib.TestTemplate.nAuthenticatedUsers(3, async (testEnvironment) => {
    const loggedInUsers = testEnvironment.loggedInUsers
    const participantCountAtStart = loggedInUsers.length
    let remainingNotifications = participantCountAtStart - 1
    return new Promise(async (resolve, reject) => {
      loggedInUsers.forEach((u) => {
        u.client.on("event.participantLeft", (event) => {
          remainingNotifications--
          if(remainingNotifications == 0) {
            /*
              We'll actually get some final notifications as mercury
              is shutting down - since we try to gracefuly disconect clients,
              which sends other clients participantLeft notifications.
              So compare == instead of <=
            */
            resolve({
              participantCountAtStart,
              countsAtEnd: loggedInUsers.filter((lu) => (lu != loggedInUsers[0])).map((lu) => (lu.client.authenticatedPeers().length))
            })
          }
        })
      })
      await loggedInUsers[0].client.disconnect()
    })

  }),

  "moving_participants": tlib.TestTemplate.nAuthenticatedUsers(3, async (testEnvironment) => {
    const loggedInUsers = testEnvironment.loggedInUsers
    const client = loggedInUsers[0].client
    const beforeMove = loggedInUsers[0].auth.stateInRoom
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


  "max_participants_respected": tlib.TestTemplate.nAuthenticatedUsers(2, async (testEnvironment) => {
    const loggedInUsers = testEnvironment.loggedInUsers
    const maxParticipantsGetter = lib.SocketGroup.prototype.getMaxParticipants
    const mockUserLimit = 2
    lib.SocketGroup.prototype.getMaxParticipants = () => (mockUserLimit)
    const ownerInfo = testEnvironment.loggedInUsers[0]

    const room = ownerInfo.room
    const roomNameEntry = ownerInfo.roomNameEntry
    const clientWithRoomAccess = await testEnvironment.createClientWithRoomAccess(room, roomNameEntry)
    try {
      await clientWithRoomAccess.initiateLoggedInSession()
      await clientWithRoomAccess.authenticateSocket()
    } catch (error) {
      return {
        error,
        mockUserLimit
      }
    } finally {
      lib.SocketGroup.prototype.getMaxParticipants = maxParticipantsGetter
    }

    return "No error"
  })

}
