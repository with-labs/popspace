global.tlib = require("../../lib/_testlib")

const requestStickyNoteCreate = async (client) => {
  return await client.sendEventWithPromise("room/addWidget", {
    type: "sticky_note",
    roomState: {
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100},
    },
    widgetState: {
      text: "Hello world!"
    }
  })
}

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
    const response = await requestStickyNoteCreate(client)
    return response
  }),

  "update_a_widget": tlib.TestTemplate.authenticatedUser(async (testEnvironment) => {
    const client = testEnvironment.loggedInUsers[0].client
    const response = await requestStickyNoteCreate(client)
    return response
  })
}
