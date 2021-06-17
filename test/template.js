require("../src/globals")
const fs = require("fs")
const AsyncLock = require('async-lock')

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
      const host = testEnvironment.getHost()

      /*
        We don't just want to connect clients -
        we want to make sure all the clients are aware of all connected clients
        before continuing.
      */
      let initsRemaining = nActors
      let roomActorClients = []
      const initializedClients = {}

      const setupPromise = new Promise(async (resolve, reject) => {
        const lock = new AsyncLock();
        const tryToFinishInitClient = async (client) => {
          if(!client.isAuthenticated() || initializedClients[client.id]) {
            return
          }
          const knownPeers = client.peersIncludingSelf()
          if(knownPeers.length >= nActors) {
            await lock.acquire('record_join', () => {
              if(initializedClients[client.id]) {
                /*
                  This could happen! Primarily as a race
                  condition between the final tryToFinishInitClient()
                  call, and an event from another client.
                  The final call can happen after an event comes in.
                  But I'm not sure if there's a way to get rid of that,
                  since we can't control which client will connect last.
                */
                return
              }
              /*
                JS doesn't atomically decrement by default,
                so if several threads mutate the variable simultaneously
                horrible things happen.
              */
              initsRemaining--
              initializedClients[client.id] = true
              /*
                This has to be inside the lock, to make sure
                the client wasn't initialized in a race condition with itself.
              */
              if(initsRemaining <= 0) {
                resolve()
              }
            })
          }
        }

        const joinCallback = (e) => {
          tryToFinishInitClient(e.recipientClient)
        }

        host.client.on('event.participantJoined', joinCallback)
        tryToFinishInitClient(host.client)
        for(let i = 0; i < nActors - 1; i++) {
          const rac = lib.test.models.RoomActorClient.create(host.room).then(async (rac) => {
            rac.client.on('event.participantJoined', joinCallback)
            roomActorClients.push(rac)
            await rac.join()
            /*
              for the last client to join, we'll never see a participantJoined event
            */
            tryToFinishInitClient(rac.client)
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
