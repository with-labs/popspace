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

  test("Enabling link for a non-existent room fails", async () => {
    const result = await scenarios["enable_invite_non_existent_room"]()
    expect(result.response.success).toEqual(false)
    expect(result.response.errorCode).toEqual(shared.error.code.UNKNOWN_ROOM)
  })

  test("Only room owners can enable invite links", async () => {
    const result = await scenarios["enable_invite_not_owner"]()
    expect(result.response.success).toEqual(false)
    expect(result.response.errorCode).toEqual(shared.error.code.PERMISSION_DENIED)
  })

  test("Can't enable invite links for deleted rooms", async () => {
    const result = await scenarios["enable_invite_deleted_room"]()
    expect(result.response.success).toEqual(false)
    expect(result.response.errorCode).toEqual(shared.error.code.UNKNOWN_ROOM)
  })

  test("Logged out users can't enable invite links", async () => {
    const result = await scenarios["enable_invite_logged_out"]()
    expect(result.response.success).toEqual(false)
    expect(result.response.errorCode).toEqual(shared.error.code.UNAUTHORIZED_USER)
  })

  test("It's possible to retrieve enabled links", async () => {
    const result = await scenarios["retrieve_invite_link"]()
    expect(result.response.inviteDetails.length).toBeGreaterThanOrEqual(1)
  })

  test("Unauthorized users can't fetch invite links", async () => {
    const result = await scenarios["retrieve_invite_link_unauthorized"]()
    expect(result.response.success).toEqual(false)
    expect(result.response.errorCode).toEqual(shared.error.code.UNAUTHORIZED_USER)
  })

  test("It's possible to disable invite links", async () => {
    const result = await scenarios["disable_invite_link"]()
    expect(result.disableResponse.success).toEqual(true)
  })

  test("Only users with sufficient permissions can disable invite links", async () => {
    const result = await scenarios["disable_invite_link_unauthorized"]()
    expect(result.disableResponse.success).toEqual(false)
    expect(result.disableResponse.errorCode).toEqual(shared.error.code.PERMISSION_DENIED)
  })

  test("Upon hitting an invite URL, users become room members", async () => {
    const result = await scenarios["logged_in_users_become_members"]()
    expect(result.isMemberBeforeJoin).toEqual(false)
    expect(result.isMemberAfterJoin).toEqual(true)
  })

  test("Upon hitting a revoked invite URL, receive error", async () => {
    const result = await scenarios["revoked_links_fail"]()
    expect(result.response.success).toEqual(false)
    expect(result.response.errorCode).toEqual(shared.error.code.REVOKED_OTP)
  })

  test("Fails when too many memberships", async () => {
    const result = await scenarios["max_members_respected"]()
    expect(result.response.success).toEqual(false)
    expect(result.response.errorCode).toEqual(shared.error.code.TOO_MANY_ROOM_MEMBERS)
  })



})
