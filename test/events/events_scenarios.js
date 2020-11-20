const tlib = require("../lib/_testlib")

module.exports = {
  "authenticate": async () => {
    const { clients, mercury } = await tlib.util.serverWithClients(1)

    const user = await factory.create("user")
    const session = await factory.create("session")
    const token = await shared.lib.auth.tokenFromSession(session)

    const beforeAuth = await clients[0].sendEventWithPromise("room/addWidget", {})
    const auth = await clients[0].authenticate(token)
    const afterAuth = await clients[0].sendEventWithPromise("room/addWidget", {})

    await mercury.stop()
    return {
      beforeAuth,
      afterAuth
    }
  }
}
