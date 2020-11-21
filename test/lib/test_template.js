module.exports = {
  describeWithLib: (name, handler) => {
    describe(name, () => {
      beforeAll(async () => {
        await lib.init()
        await shared.db.pg.silenceLogs()
      })
      afterAll(async () => {
        return lib.cleanup()
      })
      return handler()
    })
  },
  testServerClients: (nClients, lambda) => {
    return async () => {
      const { clients, mercury } = await tlib.util.serverWithClients(nClients)
      const result = await lambda(clients, mercury)
      await mercury.stop()
      return result
    }
  },
  authenticatedUser: (lambda) => {
    return tlib.TestTemplate.testServerClients(1, async (clients, mercury) => {
      const testEnvironment = new tlib.TestEnvironment()
      const client = clients[0]
      const {user, session, token, room} = await testEnvironment.createLoggedInUser(client)
      const auth = await client.authenticate(token, room.id)
      return await lambda(testEnvironment, mercury)
    })
  }
}
