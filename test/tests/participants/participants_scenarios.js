global.tlib = require("../../lib/_testlib")

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
        u.client.on("event.room/participantLeft", () => {
          remainingNotifications--
          if(remainingNotifications <= 0) {
            resolve({
              participantCountAtStart,
              countsAtEnd: loggedInUsers.filter((lu) => (lu != loggedInUsers[0])).map((lu) => (lu.client.authenticatedPeers().length))
            })
          }
        })
      })
      await loggedInUsers[0].client.disconnect()
    })

  })

}
