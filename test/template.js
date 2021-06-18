require("../src/globals")
const fs = require("fs")
const AsyncLock = require("async-lock")

class Template {
  constructor() {
    this.certificate = fs.readFileSync(process.env.SSL_ROOTCA_PATH, "utf8")
  }

  testServerClients(nClients, lambda, heartbeatTimeoutMillis) {
    return async () => {
      let result = null
      const { clients, hermes } = await lib.test.util.serverWithClients(nClients, heartbeatTimeoutMillis)
      try {
        result = await lambda(clients, hermes)
      } catch (e) {
        throw e
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
      } catch (e) {
        throw e
      } finally {
        await hermes.stop()
      }
      return result
    }
  }

  unauthenticatedActor(lambda, heartbeatTimeoutMillis) {
    return lib.test.template.testServer(async (hermes) => {
      const roomActorClient = await lib.test.models.RoomActorClient.create()

      const testEnvironment = new lib.test.TestEnvironment()
      testEnvironment.setHermes(hermes)
      testEnvironment.addRoomActorClients(roomActorClient)
      /*
        If they're unauthenticated, they're hardly a host...
        but arguably if there is a hosting situation,
        there's not reason not to make the first client
        in a test the host...
      */
      testEnvironment.setHost(roomActorClient)

      return await lambda(testEnvironment)
    }, heartbeatTimeoutMillis)
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
      // first actor is the host, created automatically
      const host = testEnvironment.getHost()
      // create the remaining actors in parallel
      const peers = await Promise.all(
        new Array(nActors - 1).fill(null).map((_, actorIndex) => lib.test.models.RoomActorClient.create(host.room))
      )
      // merge all room actor clients into one array
      const roomActorClients = [host, ...peers]
      // for each actor we will listen for join events and wait until we have
      // witnessed every other actor join the room.
      await Promise.all(
        roomActorClients.map(
          (rac) =>
            new Promise((resolve, reject) => {
              // just to stay sane, set a timeout rejection for 30 seconds
              const timeout = setTimeout(() => reject("Timed out waiting for peers to join"), 30000)
              const check = () => {
                if (!rac.client.isAuthenticated()) return
                const seenPeersCount = rac.client.peersIncludingSelf().length
                if (seenPeersCount >= nActors) {
                  clearTimeout(timeout)
                  resolve()
                }
              }
              rac.client.on("event.participantJoined", check)
              // the last client to join won't see any join events from peers, so
              // we also check for the success condition immediately
              rac.join().then(check)
            })
        )
      )
      // finally, invoke the test function with the actors in the environment
      testEnvironment.addRoomActorClients(...peers)
      return await lambda(testEnvironment)
    })
  }

  async httpClient() {
    const host = lib.appInfo.apiHost()
    const port = lib.appInfo.apiPort()
    const client = await shared.test.clients.HttpClient.anyLoggedInOrCreate(host, this.certificate, port)
    return client
  }

  async withLib(lambda, params = null) {
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
