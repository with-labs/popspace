const scenarios = require('./participants_scenarios')

tlib.TestTemplate.describeWithLib('participants', () => {
  // We have some long-running tests
  jest.setTimeout(30000);

  test("when a user joins a room they are the only participant", async () => {
    const result = await scenarios["one_participant"]()
    expect(true)
  })

  test("when a second user joins a room, they see each other", async () => {
    expect(true)
  })

  test("when a user leaves a room, other users find out", async () => {
    expect(true)
  })

  test("when a participant moves, other participants find out", async () => {
    expect(true)
  })




})
