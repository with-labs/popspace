require("jest")
const tlib = require("../lib/_testlib")
const scenarios = require('./mercury_server_scenarios')


describe('mercury_server', () => {
  jest.setTimeout(30000)

  test("starts up and shuts down gracefully", async () => {
    await scenarios["restarts_correclty"]()
    expect(true)
  })

  test("allows a connection", async () => {
    const connectedClients = await scenarios["keep_track_of_clients"]()
    expect(connectedClients.clientsCountOnServer).toEqual(connectedClients.clientsCreated)
  })

})
