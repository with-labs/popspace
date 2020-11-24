const scenarios = require('./events_scenarios')

tlib.TestTemplate.describeWithLib('mercury_client', () => {
  // We have some long-running tests
  jest.setTimeout(30000);

  test("authentication", async () => {
    const results = await scenarios["authenticate"]()
    expect(results.beforeAuth.code).toEqual("UNAUTHORIZED")
    expect(results.auth.success).toBeTruthy()
    expect(results.afterAuth.code).not.toEqual("UNAUTHORIZED")
  })

  test("authentication fail", async () => {
    const results = await scenarios["authenticate_fail"]()
    expect(results.auth.code).toEqual("AUTH_FAILED")
    expect(results.afterAuth.code).toEqual("UNAUTHORIZED")
  })


  test("creating widgets", async () => {
    const response = await scenarios["create_a_widget"]()
    expect(response.success).toEqual(true)
    expect(response.widgetId).toBeTruthy()
  })

})
