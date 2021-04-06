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
