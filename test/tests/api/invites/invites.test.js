const scenarios = require('./invites_scenarios')

tlib.TestTemplate.describeWithLib('invites', () => {
  test("It's possible to enable invite links", async () => {
    const result = await scenarios["enable_invite_link"]()
    expect(result.response.success).toEqual(true)
  })


  test("Enabling links for the same room twice gives the same link", async () => {
    const result = await scenarios["enable_invite_twice"]()
    expect(result.response1.inviteUrl).toEqual(result.response2.inviteUrl)
  })



})
