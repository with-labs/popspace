global.tlib = require("../../lib/_testlib")

module.exports = {
  "authenticate": tlib.testServerClients(1, async (clients, mercury) => {
    const user = await factory.create("user")
    const session = await factory.create("session")
    const token = await shared.lib.auth.tokenFromSession(session)

    const beforeAuth = await clients[0].sendEventWithPromise("room/addWidget", {})
    const auth = await clients[0].authenticate(token)
    const afterAuth = await clients[0].sendEventWithPromise("room/addWidget", {})

    return {
      beforeAuth,
      afterAuth
    }
  })
}
