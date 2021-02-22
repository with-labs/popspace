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
  testServerClients: (nClients, lambda, heartbeatTimeoutMillis) => {
    return async () => {
      let result = null
      const { clients, mercury } = await tlib.util.serverWithClients(nClients, heartbeatTimeoutMillis)
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
      const firstClient = testEnvironment.loggedInUsers[0].client
      const room = testEnvironment.loggedInUsers[0].room
      const roomNameEntry = testEnvironment.loggedInUsers[0].roomNameEntry

      /*
        Each user after the first one produces a certain number of join events.
        The number of events is equal to the amount of users connected before him.
        Total events: 1 + 2 + 3 + 4 + 5 + ... + (nUsers - 1)
        We go up to (nUsers - 1), because we don't count the first user.
      */
      let joinsRemaining = nUsers * (nUsers - 1)/2 - 1

      const clients = await tlib.util.addClients(testEnvironment.mercury, nUsers - 1)
      const joinsPropagatedPromise = new Promise(async (resolve, reject) => {
        [firstClient, ...clients].forEach((client) => {
          client.on('event.participantJoined', (event) => {
            joinsRemaining--
            if(joinsRemaining <= 0) {
              resolve()
            }
          })
        })
        if(joinsRemaining <= 0) {
          resolve()
        }
      })

      const inits = clients.map(async (client) => {
        const environmentUser = await testEnvironment.createLoggedInUser(client, room, roomNameEntry)
        await testEnvironment.authenticate(environmentUser)
      })
      await Promise.all(inits)
      await joinsPropagatedPromise
      return await lambda(testEnvironment)
    })

  }
}
