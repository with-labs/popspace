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
