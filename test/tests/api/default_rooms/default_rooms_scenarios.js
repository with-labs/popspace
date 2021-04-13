module.exports = {
  /**
   * Sets the user's default room to the test room
   */
  set_default_room: tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    const response = await userInfo.client.sendHttpPost("/set_default_room", {
      room_route: userInfo.roomNameEntry.name,
    })
    return { response }
  }),
  change_default_room: tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    const isEmptyRoom = true
    let roomInfo = await shared.db.rooms.generateRoom(userInfo.userId, isEmptyRoom)
    const roomRoute1 = userInfo.roomNameEntry.name
    const roomRoute2 = roomInfo.roomNameEntry.name

    const set1 = await userInfo.client.sendHttpPost("/set_default_room", {
      room_route: roomRoute1,
    })
    const get1 = await userInfo.client.sendHttpPost("/get_or_init_default_room", {})
    const set2 = await userInfo.client.sendHttpPost("/set_default_room", {
      room_route: roomRoute2,
    })
    const get2 = await userInfo.client.sendHttpPost("/get_or_init_default_room", {})
    const set3 = await userInfo.client.sendHttpPost("/set_default_room", {
      room_route: roomRoute1,
    })
    const get3 = await userInfo.client.sendHttpPost("/get_or_init_default_room", {})
    return { sequence: [
      {route: roomRoute1, response: set1, defaultRoomAfter: get1},
      {route: roomRoute2, response: set2, defaultRoomAfter: get2},
      {route: roomRoute1, response: set3, defaultRoomAfter: get3}
    ] }
  }),
  get_default_room: tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    const response = await userInfo.client.sendHttpPost("/get_or_init_default_room", {})
    return { response, userInfo }
  }),
  revoke_default_room_membership: tlib.TestTemplate.nAuthenticatedUsers(2, async (testEnvironment) => {
    const localUserInfo = testEnvironment.loggedInUsers[0]
    const remoteUserInfo = testEnvironment.loggedInUsers[1]
    // set remote user's default room to local user
    const response1 = await remoteUserInfo.client.sendHttpPost("/set_default_room", {
      room_route: localUserInfo.roomNameEntry.name,
    })
    // revoke remote user's membership to their default room
    await shared.db.room.memberships.revokeMembership(localUserInfo.room.id, remoteUserInfo.user.id)
    const response2 = await remoteUserInfo.client.sendHttpPost("/get_or_init_default_room", {})
    return { response1, response2, userInfo: remoteUserInfo }
  }),
}
