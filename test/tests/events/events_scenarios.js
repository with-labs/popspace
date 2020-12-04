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
    const startRoomData = testEnvironment.loggedInUsers[0].auth.data.room
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
    const widgetsInRoom = auth.data.room.widgets
    let widget = null
    if(widgetsInRoom.length < 1) {
      const createResponse = await requestStickyNoteCreate(client)
      widget = createResponse.payload.widget
    } else {
      widget = widgetsInRoom[0]
    }
    const beforeMove = Object.assign({}, widget)

    const move = {
      widget_id: widget.widget_id,
      roomState: {
        position: {
          x: parseInt(beforeMove.roomState.position.x) + 30,
          y: parseInt(beforeMove.roomState.position.y) + 60
        }
      }
    }
    await client.sendEventWithPromise("room/moveObject", move)
    const newState = await client.getWidgetState(widget.widget_id)

    return {
      beforeMove,
      afterMove: newState.payload
    }
  })
}
