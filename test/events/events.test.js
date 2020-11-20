require("jest")
const tlib = require("../lib/_testlib")
const scenarios = require('./events_scenarios')


describe('mercury_client', () => {
  // We have some long-running tests
  jest.setTimeout(30000);

  test("authentication", async () => {
    const results = await scenarios["authenticate"]()
    expect(results.beforeAuth.code).toEqual("UNAUTHORIZED")
    expect(results.afterAuth.code).notToEqual("UNAUTHORIZED")
  })
})
