global.tlib = require("../../lib/_testlib")

module.exports = {
  "restarts_correclty": async () => {
    for(let i = 0; i < 5; i++) {
      let { clients, mercury } = await tlib.util.serverWithClients(i + 1, "restarts_correclty")
      await mercury.stop()
    }
  },

  "keep_track_of_clients": tlib.TestTemplate.testServerClients(1, async (clients, mercury) => {
    const connectedClients = mercury.clientsCount()
    return {
      clientsCountOnServer: connectedClients,
      clientsCreated: clients.length
    }
  }),


  "refuse_unauthorized_entry": tlib.TestTemplate.authenticatedUser(async (testEnvironment) => {
      const firstClient = testEnvironment.loggedInUsers[0].client
      const room = testEnvironment.loggedInUsers[0].room
      const roomNameEntry = testEnvironment.loggedInUsers[0].roomNameEntry

      const unauthorizedClients = await tlib.util.addClients(testEnvironment.mercury, 1)
      const unauthorizedClient = unauthorizedClients[0]

      const user = await factory.create("user")
      const session = await factory.create("session", {user_id: user.id})
      const token = await shared.lib.auth.tokenFromSession(session)
      const environmentUser = { user, session, token, room, roomNameEntry, client: unauthorizedClient }

      try {
        await testEnvironment.authenticate(environmentUser)
      } catch (error) {
        return error
      }
  })
}
