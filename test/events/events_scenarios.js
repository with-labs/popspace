const tlib = require("../lib/_testlib")

module.exports = {
  "authenticate": async () => {
    const { clients, mercury } = await tlib.util.serverWithClients(1)

    const user = await factory.create("user")
    const session = await factory.create("session")
    const token = await shared.lib.auth.tokenFromSession(session)

    const result = await clients[0].authenticate(token)

    await mercury.stop()
    return result
  }
}
