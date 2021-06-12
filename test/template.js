module.exports = {

  testServerClients: (nClients, lambda, heartbeatTimeoutMillis) => {
    return async () => {
      let result = null
      const { clients, mercury } = await lib.test.util.serverWithClients(nClients, heartbeatTimeoutMillis)
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
  authenticatedActor: (lambda) => {
    return lib.test.Template.testServerClients(1, async (clients, mercury) => {
      const testEnvironment = new lib.test.TestEnvironment()
      const client = clients[0]
      const environmentActor = await testEnvironment.createLoggedInActor(client)
      await testEnvironment.authenticate(environmentActor)
      testEnvironment.setMercury(mercury)
      return await lambda(testEnvironment, mercury)
    })
  },

  nAuthenticatedActors: (nActors, lambda) => {
    return lib.test.Template.authenticatedActor(async (testEnvironment) => {
      const firstClient = testEnvironment.loggedInActors[0].client
      const room = testEnvironment.loggedInActors[0].room

      /*
        Each actor after the first one produces a certain number of join events.
        The number of events is equal to the amount of actors connected before him.
        Total events: 1 + 2 + 3 + 4 + 5 + ... + (nActors - 1)
        We go up to (nActors - 1), because we don't count the first actor.
      */
      let joinsRemaining = nActors * (nActors - 1)/2 - 1

      const clients = await lib.test.util.addClients(testEnvironment.mercury, nActors - 1)
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
        const environmentActor = await testEnvironment.createLoggedInActor(client, room)
        await testEnvironment.authenticate(environmentActor)
      })
      await Promise.all(inits)
      await joinsPropagatedPromise
      return await lambda(testEnvironment)
    })

  }
}
