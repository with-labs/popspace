global.tlib = require("../../lib/_testlib")

const requestStickyNoteCreate = async (client) => {
  return await client.sendEventWithPromise("createWidget", {
    type: "sticky_note",
    transform: {
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100},
    },
    widgetState: {
      text: "Hello world!"
    }
  })
}

const getOrCreateWidget = async (client, authData) => {
   const widgetsInRoom = authData.room.widgets
    if(widgetsInRoom.length < 1) {
      const createResponse = await requestStickyNoteCreate(client)
      return createResponse.payload
    } else {
      return widgetsInRoom[0]
    }
}

module.exports = {
  "authenticate": tlib.TestTemplate.testServerClients(1, async (clients) => {
    const testEnvironment = new tlib.TestEnvironment()
    const { user, session, token, room, roomNameEntry } = await testEnvironment.createLoggedInUser()
    const beforeAuth = await clients[0].sendEventWithPromise("createWidget", {})
    const auth = await clients[0].authenticate(token, roomNameEntry.name)
    const afterAuth = await clients[0].sendEventWithPromise("createWidget", {})
    return {
      beforeAuth,
      auth,
      afterAuth
    }
  }),

  "authenticate_fail_wrong_token": tlib.TestTemplate.testServerClients(1, async (clients) => {
    const testEnvironment = new tlib.TestEnvironment()
    const { user, session, token, room, roomNameEntry } = await testEnvironment.createLoggedInUser()
    let response = null
    try {
      response = await clients[0].authenticate("{}", roomNameEntry.name)
    } catch(e) {
      response = e
    }

    const afterAuth = await clients[0].sendEventWithPromise("createWidget", {})
    return {
      auth: response,
      afterAuth
    }
  }),

  "authenticate_fail_no_such_room": tlib.TestTemplate.testServerClients(1, async (clients) => {
    const testEnvironment = new tlib.TestEnvironment()
    const { user, session, token, room, roomNameEntry } = await testEnvironment.createLoggedInUser()
    let response = null
    try {
      response = await clients[0].authenticate("{}", "faken_ame2000_")
    } catch(e) {
      response = e
    }
    const afterAuth = await clients[0].sendEventWithPromise("createWidget", {})
    return {
      auth: response,
      afterAuth
    }
  }),

  "create_a_widget": tlib.TestTemplate.authenticatedUser(async (testEnvironment) => {
    const client = testEnvironment.loggedInUsers[0].client
    const startRoomData = testEnvironment.loggedInUsers[0].auth.payload.room
    const createResponse = await requestStickyNoteCreate(client)
    const getResponse = await client.getRoomState()
    return {
      createResponse,
      beginWidgetCount: startRoomData.widgets.length,
      endWidgetCount: getResponse.payload.widgets.length
    }
  }),

  "move_a_widget": tlib.TestTemplate.authenticatedUser(async (testEnvironment) => {
    const client = testEnvironment.loggedInUsers[0].client
    const auth = testEnvironment.loggedInUsers[0].auth
    const widget = await getOrCreateWidget(client, auth.payload)
    const beforeMove = Object.assign({}, widget)

    const move = {
      widgetId: widget.widgetId,
      transform: {
        position: {
          x: parseInt(beforeMove.transform.position.x) + 30,
          y: parseInt(beforeMove.transform.position.y) + 60
        }
      }
    }
    await client.sendEventWithPromise("moveWidget", move)
    const newState = await client.getWidgetState(widget.widgetId)

    return {
      beforeMove,
      afterMove: newState.payload
    }
  }),

  "update_wallpaper": tlib.TestTemplate.authenticatedUser(async (testEnvironment) => {
    const client = testEnvironment.loggedInUsers[0].client
    const startRoomData = testEnvironment.loggedInUsers[0].auth.payload.room
    const updateResponse = await client.sendEventWithPromise("updateRoomState", {
      wallpaperUrl: "https://s3-us-west-2.amazonaws.com/with.wallpapers/To-Do_Board_Galaxy.jpg"
    })
    const getResponse = await client.getRoomState()
    return {
      updateResponse,
      newRoomState: getResponse
    }
  }),

  "create_then_delete": tlib.TestTemplate.authenticatedUser(async (testEnvironment) => {
    const client = testEnvironment.loggedInUsers[0].client
    const startRoomData = testEnvironment.loggedInUsers[0].auth.payload.room

    const createResponse = await requestStickyNoteCreate(client)
    const widgetId = createResponse.payload.widgetId
    const roomStateAfterCreate = await client.getRoomState()
    const deleteResponse = await client.sendEventWithPromise("deleteWidget", {widgetId})
    const roomStateAfterDelete = await client.getRoomState()

    return {
      createResponse,
      deleteResponse,
      roomStateAfterCreate,
      roomStateAfterDelete
    }
  }),
}
