require("../../test/_test.js")
const scenarios = require("./rooms_scenarios.js")

shared.test.TestTemplate.describeWithLib("rooms", () => {
  test("can successfully generate a new meeting URL", async () => {
    const result = await scenarios["meeting_url"]()
    const response = result.response
    expect(response.success).toEqual(true)
    expect(response.url).toBeTruthy()
    expect(response.urlId).toBeTruthy()
  })

  test("should successfully get opengraph data", async () => {
    const result = await scenarios["opengraph"]()
    const response = result.response
    expect(response.success).toEqual(true)
    expect(response.result.title).toEqual("http://www.google.com")
    expect(response.result.iframeUrl).toEqual(null)
    expect(response.result.iconUrl).toEqual(null)
  }),

  test("should fail to get get opengraph data", async () => {
    const result = await scenarios["opengraph_fail"]()
    const response = result.response
    expect(response.success).toEqual(false)
    expect(response.errorCode).toEqual("NO_OPENGRAPH_DATA")
    expect(response.message).toEqual('Unknown error')
  })
})
