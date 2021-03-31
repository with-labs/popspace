global.tlib = require("../../../lib/_testlib")
const scenarios = require('./newsletter_scenarios')

tlib.TestTemplate.describeWithLib('invites', () => {
  test("It's possible to subscribe to newsletters", async () => {
    const result = await scenarios["newsletter_subscribe"]()
    expect(result.response.success).toEqual(true)
    expect(result.userBeforeSubscribe.newsletter_opt_in).toEqual(false)
    expect(result.userAfterSubscribe.newsletter_opt_in).toEqual(true)
  })

  test("It's possible to unsubscribe from newsletters", async () => {
    const result = await scenarios["newsletter_unsubscribe"]()
    expect(result.response.success).toEqual(true)
    expect(result.userBeforeUnsubscribe.newsletter_opt_in).toEqual(true)
    expect(result.userAfterUnsubscribe.newsletter_opt_in).toEqual(false)
  })

  test("Subscribe magic links work", async () => {
    const result = await scenarios["magic_link_subscribe"]()
    expect(result.response.success).toEqual(true)
    expect(result.userBeforeSubscribe.newsletter_opt_in).toEqual(false)
    expect(result.userAfterSubscribe.newsletter_opt_in).toEqual(true)
  })

  test("Unsubscribe magic links work", async () => {
    const result = await scenarios["magic_link_unsubscribe"]()
    expect(result.response.success).toEqual(true)
    expect(result.userBeforeUnsubscribe.newsletter_opt_in).toEqual(true)
    expect(result.userAfterUnsubscribe.newsletter_opt_in).toEqual(false)
  })

})