const scenarios = require('./participants_scenarios')

tlib.TestTemplate.describeWithLib('participants', () => {
  // We have some long-running tests
  jest.setTimeout(30000);

  test("when new users join a room, they are visible to all other peers", async () => {
    const result = await scenarios["participants_see_each_other"]()
    result.countsAtEnd.forEach((participantCountAccordingToPeer) => {
      expect(participantCountAccordingToPeer).toEqual(result.desiredParticipants)
      expect(participantCountAccordingToPeer).toEqual(result.desiredParticipants)
    })
  })

  test("when a user leaves a room, other users find out", async () => {
    const result = await scenarios["disconnecting_participants"]()
    result.countsAtEnd.forEach((endCount) => {
      expect(endCount).toEqual(result.participantCountAtStart - 1)
    })
  })

  // test("when a participant moves, other participants find out", async () => {
  //   const result = await scenarios["moving_participants"]
  //   expect(true)
  // })

  test("when the max participant limit is reached, new ones can't join", async () => {
    const result = await scenarios["max_participants_respected"]()
    expect(result.error.kind).toEqual("error")
    expect(result.error.code).toEqual(tlib.lib.ErrorCodes.TOO_MANY_PARTICIPANTS)
    expect(result.error.payload.limit).toEqual(result.mockUserLimit)
  })




})
