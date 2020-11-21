const scenarios = require('./events_scenarios')

tlib.TestTemplate.describeWithLib('mercury_client', async () => {
  // We have some long-running tests
  jest.setTimeout(30000);

  test("authentication", async () => {
    const results = await scenarios["authenticate"]()
    expect(results.beforeAuth.code).toEqual("UNAUTHORIZED")
    expect(results.afterAuth.code).not.toEqual("UNAUTHORIZED")
  })

  test("creating widgets", async () => {

  })
})
