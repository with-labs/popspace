require("dotenv").config()
require("../../src/globals.js")
shared.test = shared.requireTesting()
const scenarios = require("./users_scenarios.js")

shared.test.TestTemplate.describeWithLib("users", () => {
  test("Creating user stubs works", async () => {
    const result = await scenarios["stubbing_users"]()
    const response = result.response
    expect(response.success).toEqual(true)
    expect(response.actor.kind).toEqual("user")
    expect(response.sessionToken).toBeTruthy()
  })
})
