module.exports = {
  "newsletter_subscribe": tlib.TestTemplate.testServerClients(0, async (testEnvironment) => {
    const roomUserClient = await tlib.models.RoomUserClient.anyOrCreate()
    await shared.db.accounts.newsletterUnsubscribe(roomUserClient.userId)
    const userBeforeSubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    const response = await roomUserClient.client.sendHttpPost("/subscribe_to_newsletter", { })
    const userAfterSubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    return { response, userBeforeSubscribe, userAfterSubscribe }
  }),

  "newsletter_unsubscribe": tlib.TestTemplate.nAuthenticatedUsers(0, async (testEnvironment) => {
    const roomUserClient = await tlib.models.RoomUserClient.anyOrCreate()
    await shared.db.accounts.newsletterSubscribe(roomUserClient.userId)
    const userBeforeUnsubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    const response = await roomUserClient.client.sendHttpPost("/unsubscribe_from_newsletter", { })
    const userAfterUnsubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    return { response, userBeforeUnsubscribe, userAfterUnsubscribe }
  }),

  "magic_link_subscribe": tlib.TestTemplate.nAuthenticatedUsers(0, async (testEnvironment) => {
    const roomUserClient = await tlib.models.RoomUserClient.anyOrCreate()
    await shared.db.accounts.newsletterUnsubscribe(roomUserClient.userId)
    const userBeforeSubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    const magicLink = await shared.db.magic.createSubscribe(roomUserClient.userId)
    const loggedOutSender = new lib.Client()
    const response = await loggedOutSender.sendHttpPost("/magic_link_subscribe", {magicLinkId: magicLink.id, otp: magicLink.otp})
    const userAfterSubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    return { response, userBeforeSubscribe, userAfterSubscribe }
  }),

  "magic_link_unsubscribe": tlib.TestTemplate.nAuthenticatedUsers(0, async (testEnvironment) => {
    const roomUserClient = await tlib.models.RoomUserClient.anyOrCreate()
    await shared.db.accounts.newsletterSubscribe(roomUserClient.userId)
    const userBeforeUnsubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    const magicLink = await shared.db.magic.createUnsubscribe(roomUserClient.userId)
    const loggedOutSender = new lib.Client()
    const response = await loggedOutSender.sendHttpPost("/magic_link_unsubscribe", {magicLinkId: magicLink.id, otp: magicLink.otp})
    const userAfterUnsubscribe = await shared.db.pg.massive.users.findOne({id: roomUserClient.userId})
    return { response, userBeforeUnsubscribe, userAfterUnsubscribe }
  }),
}