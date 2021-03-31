module.exports = {
  "newsletter_subscribe": tlib.TestTemplate.testServerClients(0, async (testEnvironment) => {
    const roomUserClient = await tlib.models.RoomUserClient.anyOrCreate()
    await shared.db.accounts.newsletterUnsubscribe(roomUserClient.userId)
    const userBeforeSubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    const response = await roomUserClient.client.sendHttpPost("/subscribe_to_newsletter", { })
    const userAfterSubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    return { response, userBeforeSubscribe, userAfterSubscribe }
  }),

  "newsletter_unsubscribe": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const roomUserClient = await tlib.models.RoomUserClient.anyOrCreate()
    await shared.db.accounts.newsletterSubscribe(roomUserClient.userId)
    const userBeforeUnsubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    const response = await roomUserClient.client.sendHttpPost("/unsubscribe_from_newsletter", { })
    const userAfterUnsubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    return { response, userBeforeUnsubscribe, userAfterUnsubscribe }
  }),

  "enable_invite_non_existent_room": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    const response = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_route: "randomroomroute123s"})
    return { response }
  }),
}