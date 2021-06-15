require("../src/globals")
const fs = require("fs")

class Template {
  constructor() {
    this.certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8')
  }

  testServerClients(nClients, lambda, heartbeatTimeoutMillis) {
    return async () => {
      let result = null
      const { clients, hermes } = await lib.test.util.serverWithClients(nClients, heartbeatTimeoutMillis)
      try {
        result = await lambda(clients, hermes)
      } catch(e) {
        throw(e)
      } finally {
        await hermes.stop()
      }
      return result
    }


  }

  testServer(lambda, heartbeatTimeoutMillis) {
    return async () => {
      let result = null
      const hermes = await lib.test.util.server(heartbeatTimeoutMillis)
      try {
        result = await lambda(hermes)
      } catch(e) {
        throw(e)
      } finally {
        await hermes.stop()
      }
      return result
    }
  }

  authenticatedActor(lambda, heartbeatTimeoutMillis) {
    return lib.test.template.testServer(async (hermes) => {
      const roomActorClient = await lib.test.models.RoomActorClient.create()
      await roomActorClient.join()

      const testEnvironment = new lib.test.TestEnvironment()
      testEnvironment.setHermes(hermes)
      testEnvironment.addRoomActorClient(roomActorClient)

      return await lambda(testEnvironment)
    }, heartbeatTimeoutMillis)
  }

  nAuthenticatedActors(nActors, lambda) {
    return lib.test.template.authenticatedActor(async (testEnvironment) => {
      const firstClient = testEnvironment.loggedInActors[0].client
      const room = testEnvironment.loggedInActors[0].room

      /*
        Each actor after the first one produces a certain number of join events.
        The number of events is equal to the amount of actors connected before him.
        Total events: 1 + 2 + 3 + 4 + 5 + ... + (nActors - 1)
        We go up to (nActors - 1), because we don't count the first actor.
      */
      let joinsRemaining = nActors * (nActors - 1)/2 - 1

      const clients = await lib.test.util.addClients(nActors - 1)
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

  async httpClient() {
    const host = lib.appInfo.apiHost()
    const port = lib.appInfo.apiPort()
    const client = await shared.test.clients.HttpClient.anyLoggedInOrCreate(host, this.certificate, port)
    return client
  }

  async withLib(lambda, params=null) {
    /*
      NOTE: usually we don't want to do this.
      The shared tempalte lib already initializes the library.
      But for running individual test scenarios it can be useful.
    */
    await lib.init()
    try {
      const result = await lambda(params)
    } finally {
      await lib.cleanup()
    }
    return result
  }
}

module.exports = new Template()
