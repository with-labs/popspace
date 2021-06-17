require("../src/globals")
const fs = require("fs")

class Template {
  constructor() {
    this.certificate = fs.readFileSync(process.env.SSL_ROOTCA_PATH, 'utf8')
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
      testEnvironment.addRoomActorClients(roomActorClient)
      testEnvironment.setHost(roomActorClient)

      return await lambda(testEnvironment)
    }, heartbeatTimeoutMillis)
  }

  nAuthenticatedActors(nActors, lambda) {
    return lib.test.template.authenticatedActor(async (testEnvironment) => {
      const host = testEnvironment.getHost()

      let joinsRemaining = nActors * (nActors - 1)/2 - 1
      let roomActorClients = []

      const setupPromise = new Promise((resolve, reject) => {
        const joinCallback = () => {
          joinsRemaining--
          if(joinsRemaining <= 0) {
            resolve()
          }
        }
        host.client.on('event.participantJoined', joinCallback)
        for(let i = 0; i < nActors - 1; i++) {
          lib.test.models.RoomActorClient.create(host.room).then((rac) => {
            roomActorClients.push(rac)
            rac.client.on('event.participantJoined', joinCallback)
          }).catch((e) => {
            console.error(e)
          })
        }
      })
      try {
        await setupPromise
      } catch(e) {
        console.error(e)
      }

      testEnvironment.addRoomActorClients(...roomActorClients)
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
