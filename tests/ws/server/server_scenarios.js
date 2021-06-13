module.exports = {
  "restarts_correclty": async () => {
    for(let i = 0; i < 5; i++) {
      let { clients, hermes } = await lib.test.util.serverWithClients(i + 1)
      await hermes.stop()
    }
  },

  "keep_track_of_clients": lib.test.template.testServerClients(1, async (clients, hermes) => {
    const connectedClients = hermes.clientsCount()
    return {
      clientsCountOnServer: connectedClients,
      clientsCreated: clients.length
    }
  }),

  "refuse_unauthorized_entry": lib.test.template.authenticatedActor(async (testEnvironment) => {
      const firstClient = testEnvironment.loggedInActors[0].client
      const room = testEnvironment.loggedInActors[0].room

      const unauthorizedClients = await lib.test.util.addClients(testEnvironment.hermes, 1)
      const unauthorizedClient = unauthorizedClients[0]

      const actor = await factory.create("actor")
      const session = await factory.create("session", {actor_id: actor.id})
      const token = await shared.lib.auth.tokenFromSession(session)
      const environmentActor = { actor, session, token, room, client: unauthorizedClient }

      try {
        await testEnvironment.authenticate(environmentActor)
      } catch (error) {
        return error
      }
  }),

  "heartbeat_timeout_disconnect": lib.test.template.testServerClients(1, async (clients, hermes) => {
    const clientsBeforeTimeout = hermes.clientsCount()
    await new Promise((resolve, reject) => setTimeout(resolve, 200));
    const clientsAfterTimeout = hermes.clientsCount()
    return {
      clientsBeforeTimeout,
      clientsAfterTimeout
    }
  }, 100)
}
