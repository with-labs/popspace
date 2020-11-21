const scenarios = require('./mercury_server_scenarios')

tlib.TestTemplate.describeWithLib('mercury_server', () => {
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
