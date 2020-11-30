global.tlib = require("../../lib/_testlib")

module.exports = {
  "authenticate": tlib.TestTemplate.testServerClients(1, async (clients) => {
    const testEnvironment = new tlib.TestEnvironment()
    const { user, session, token, room, roomNameEntry } = await testEnvironment.createLoggedInUser()

    const beforeAuth = await clients[0].sendEventWithPromise("room/addWidget", {})
    const auth = await clients[0].authenticate(token, roomNameEntry.name)
    const afterAuth = await clients[0].sendEventWithPromise("room/addWidget", {})

    return {
      beforeAuth,
      auth,
      afterAuth
    }
  }),

  "authenticate_fail_wrong_token": tlib.TestTemplate.testServerClients(1, async (clients) => {
    const testEnvironment = new tlib.TestEnvironment()
    const { user, session, token, room, roomNameEntry } = await testEnvironment.createLoggedInUser()
    const auth = await clients[0].authenticate("{}", roomNameEntry.name)
    const afterAuth = await clients[0].sendEventWithPromise("room/addWidget", {})
    return {
      auth,
      afterAuth
    }
  }),

  "authenticate_fail_no_such_room": tlib.TestTemplate.testServerClients(1, async (clients) => {
    const testEnvironment = new tlib.TestEnvironment()
    const { user, session, token, room, roomNameEntry } = await testEnvironment.createLoggedInUser()
    const auth = await clients[0].authenticate("{}", roomNameEntry.name)
    const afterAuth = await clients[0].sendEventWithPromise("room/addWidget", {})
    return {
      auth,
      afterAuth
    }
  }),


  "create_a_widget": tlib.TestTemplate.authenticatedUser(async (testEnvironment) => {
    const client = testEnvironment.loggedInUsers[0].client
    const response = await client.sendEventWithPromise("room/addWidget", {})
    return response
  })
}
