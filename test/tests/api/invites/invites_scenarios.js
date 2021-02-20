global.tlib = require("../../../lib/_testlib")

module.exports = {
  "enable_invite_link": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    const response = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
    return { response }
  }),

  "enable_invite_twice": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    const response1 = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
    const response2 = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
    return { response1, response2 }
  }),

  "enable_invite_non_existent_room": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    const response = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: "randomroomroute123s"})
    return { response }
  }),

  "enable_invite_not_owner": tlib.TestTemplate.nAuthenticatedUsers(2, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[1]
    const response = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
    return { response }
  }),

  "enable_invite_deleted_room": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    /*
      NOTE: it would be even nicer if the delete happened through the API.
      e.g. if the delete API lived in mercury, that would be possible.
    */
    const userInfo = testEnvironment.loggedInUsers[0]
    await shared.db.rooms.deleteRoom(userInfo.room.id)
    const response = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
    return { response }
  }),

  "enable_invite_logged_out": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const loggedOutClient = testEnvironment.loggedInUsers[0].client
    /*
      It's sort of more effort to set up an HTTPS request w/o all the overhead.
      On the other hand, the most realistic case for sending a logged out request
      is when the page was loaded as logged in, then something happened to the token -
      expiration, clearing local storage - and the request being sent,
      so this type of test mirrors reality more ("it's not a bug, it's a feature")
    */
    loggedOutClient.authToken = ""
    console.log("================ sending request")
    const response = await loggedOutClient.sendHttpPost("/enable_public_invite_link", {room_route: ""})
    return { response }
  }),

  "retrieve_invite_link": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    const enableResponse = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
    const retrieveResponse = await userInfo.client.sendHttpPost("/get_public_invite_details", {room_route: userInfo.roomNameEntry.name})
    return { response: retrieveResponse }
  }),

  "retrieve_invite_link_unauthorized": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
      const userInfo = testEnvironment.loggedInUsers[0]
      const enableResponse = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
      const unauthorizedClients = await tlib.util.addClients(testEnvironment.mercury, 1)
      const unauthorizedClient = unauthorizedClients[0]
      const retrieveResponse = await unauthorizedClient.sendHttpPost("/get_public_invite_details", {room_route: userInfo.roomNameEntry.name})
      return { response: retrieveResponse }
  }),

  "disable_invite_link": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    const enableResponse = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
    const disableResponse = await userInfo.client.sendHttpPost("/disable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
    return { enableResponse, disableResponse }
  }),

  "disable_invite_link_unauthorized": tlib.TestTemplate.nAuthenticatedUsers(2, async (testEnvironment) => {
    const authorizedEnabler = testEnvironment.loggedInUsers[0]
    const roomNameEntry = authorizedEnabler.roomNameEntry
    const enableResponse = await authorizedEnabler.client.sendHttpPost("/enable_public_invite_link", {room_route: roomNameEntry.name})
    const unauthorizedDisabler = testEnvironment.loggedInUsers[1]
    const disableResponse = await unauthorizedDisabler.client.sendHttpPost("/disable_public_invite_link", {room_route: roomNameEntry.name})
    return { enableResponse, disableResponse }
  }),

  "logged_in_users_become_members":  tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
      const userInfo = testEnvironment.loggedInUsers[0]
      const enableResponse = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
      const joiningUser = await factory.create("user")
      const {session, token} = await testEnvironment.initiateLoggedInSession(joiningUser.id)
      const joiningClient = (await tlib.util.addClients(testEnvironment.mercury, 1))[0]
      await joiningClient.logIn(token)
      const isMemberBeforeJoin = await shared.db.room.memberships.isMember(joiningUser.id, userInfo.room.id)
      const response = await joiningClient.sendHttpPost("/room_membership_through_public_invite_link", {invite_id: enableResponse.inviteId, otp: enableResponse.otp})
      const isMemberAfterJoin = await shared.db.room.memberships.isMember(joiningUser.id, userInfo.room.id)
      return { response, isMemberBeforeJoin, isMemberAfterJoin }
  }),


  "revoked_links_fail":  tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
      const userInfo = testEnvironment.loggedInUsers[0]
      const enableResponse = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
      const joiningUser = await factory.create("user")
      const {session, token} = await testEnvironment.initiateLoggedInSession(joiningUser.id)
      const joiningClient = (await tlib.util.addClients(testEnvironment.mercury, 1))[0]
      await joiningClient.logIn(token)
      const disableResponse = await userInfo.client.sendHttpPost("/disable_public_invite_link", {room_route: userInfo.roomNameEntry.name})
      const response = await joiningClient.sendHttpPost("/room_membership_through_public_invite_link", {invite_id: enableResponse.inviteId, otp: enableResponse.otp})
      return { response }
  }),

}
