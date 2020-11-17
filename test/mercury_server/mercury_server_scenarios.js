const tlib = require("../lib/_testlib")

module.exports = {
  "restarts_correclty": async () => {
    for(let i = 0; i < 5; i++) {
      let { clients, mercury } = await tlib.util.serverWithClients(i + 1, "restarts_correclty")
      await mercury.stop()
    }
  },

  "keep_track_of_clients": async (numberOfConnections=2) => {
    const { clients, mercury } = await tlib.util.serverWithClients(numberOfConnections, "keep_track_of_clients")
    const connectedClients = mercury.clientsCount()
    await mercury.stop()
    console.log("STOPPED")
    return {
      clientsCountOnServer: connectedClients,
      clientsCreated: numberOfConnections
    }
  }
}
