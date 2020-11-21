global.tlib = require("../../lib/_testlib")

module.exports = {
  "restarts_correclty": async () => {
    for(let i = 0; i < 5; i++) {
      let { clients, mercury } = await tlib.util.serverWithClients(i + 1, "restarts_correclty")
      await mercury.stop()
    }
  },

  "keep_track_of_clients": tlib.testServerClients(1, async (clients, mercury) => {
    const connectedClients = mercury.clientsCount()
    return {
      clientsCountOnServer: connectedClients,
      clientsCreated: clients.length
    }
  })
}
