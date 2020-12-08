module.exports = {
  describeWithLib: (name, handler) => {
    describe(name, () => {
      beforeAll(async () => {
        await lib.init()
        await shared.db.pg.silenceLogs()
      })
      afterAll(async () => {
        return lib.cleanup()
      })
      return handler()
    })
  },
  testServerClients: (nClients, lambda) => {
    return async () => {
      let result = null
      const { clients, mercury } = await tlib.util.serverWithClients(nClients)
      try {
        result = await lambda(clients, mercury)
      } catch(e) {
        throw(e)
      } finally {
        await mercury.stop()
      }
      return result
    }
  },
  authenticatedUser: (lambda) => {
    return tlib.TestTemplate.testServerClients(1, async (clients, mercury) => {
      const testEnvironment = new tlib.TestEnvironment()
      const client = clients[0]
      const environmentUser = await testEnvironment.createLoggedInUser(client)
      await testEnvironment.authenticate(environmentUser)
      testEnvironment.setMercury(mercury)
      return await lambda(testEnvironment, mercury)
    })
  },

  nAuthenticatedUsers: (nUsers, lambda) => {
    return tlib.TestTemplate.authenticatedUser(async (testEnvironment) => {
      const room = testEnvironment.loggedInUsers[0].room
      const roomNameEntry = testEnvironment.loggedInUsers[0].roomNameEntry
      const clients = await tlib.util.addClients(testEnvironment.mercury, nUsers - 1)
      const inits = clients.map(async (client) => {
        const environmentUser = await testEnvironment.createLoggedInUser(client, room, roomNameEntry)
        await testEnvironment.authenticate(environmentUser)
      })
      await Promise.all(inits)
      return await lambda(testEnvironment)
    })

  }
}
