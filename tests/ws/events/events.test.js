require("../../../test/_test.js")
const scenarios = require('./events_scenarios')

shared.test.TestTemplate.describeWithLib('mercury_events', () => {
  // We have some long-running tests
  jest.setTimeout(30000);

  test("authentication", async () => {
    const results = await scenarios["authenticate"]()
    expect(results.beforeAuth.code).toEqual("UNAUTHORIZED")
    expect(results.auth.kind).toBeTruthy()
    expect(results.auth.kind).not.toEqual("error")
    expect(results.afterAuth.code).not.toEqual("UNAUTHORIZED")
  })

  test("authentication should fail with wrong session token", async () => {
    const results = await scenarios["authenticate_fail_wrong_token"]()
    expect(results.auth.kind).toEqual("error")
    expect(results.auth.code).toEqual("AUTH_FAILED")
    expect(results.afterAuth.code).toEqual("UNAUTHORIZED")
  })

  test("authentication should fail when no such room", async () => {
    const results = await scenarios["authenticate_fail_no_such_room"]()
    expect(results.auth.kind).toEqual("error")
    expect(results.auth.code).toEqual("UNKNOWN_ROOM")
    expect(results.afterAuth.code).toEqual("UNAUTHORIZED")
  })

  test("creating widgets", async () => {
    const { createResponse, beginWidgetCount, endWidgetCount } = await scenarios["create_a_widget"]()
    expect(createResponse.kind).toEqual("widgetCreated")

    expect(createResponse.payload.widgetId).toBeTruthy()
    expect(endWidgetCount - beginWidgetCount).toEqual(1)
  })

  test('updating widgets', async () => {
    const response = await scenarios["move_a_widget"]()
    const positionBeforeMove = response.beforeMove.transform.position
    const positionAfterMove = response.afterMove.transform.position
    expect(parseInt(positionAfterMove.x) - parseInt(positionBeforeMove.x) == 30)
    expect(parseInt(positionAfterMove.y) - parseInt(positionBeforeMove.y) == 60)
  })

  test('updating a room wallpaper', async () => {
    const result = await scenarios["update_wallpaper"]()
    expect(result.updateResponse.kind).toEqual("roomStateUpdated")
    expect(result.updateResponse.payload.wallpaperUrl).toEqual(result.newRoomState.payload.state.wallpaperUrl)
  })

  test('deleting a widget', async () => {
    const result = await scenarios["create_then_delete"]()
    expect(result.deleteResponse.kind).toEqual("widgetDeleted")
    expect(result.roomStateAfterCreate.payload.widgets.length - 1).toEqual(result.roomStateAfterDelete.payload.widgets.length)
  })

  test('passthrough events', async () => {
    const result = await scenarios["passthrough"]()
    expect(result.sentEvent.kind).toEqual("passthrough")
    for(const receivedEvent of result.receivedEvents) {
      expect(receivedEvent.kind).toEqual("passthrough")
      expect(receivedEvent.payload).toEqual(result.sentEvent.payload)
    }
  })

})
