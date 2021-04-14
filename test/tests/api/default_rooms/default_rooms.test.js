global.tlib = require("../../../lib/_testlib")
const scenarios = require("./default_rooms_scenarios")

async function isRoomAccessibleToUser(userInfo, roomRoute) {
  const ownedRooms = await shared.db.rooms.getOwnedRoutableRooms(userInfo.userId)
  const memberRooms = await shared.db.rooms.getMemberRoutableRooms(userInfo.userId)
  const allAccessRooms = [].concat(ownedRooms).concat(memberRooms)
  return allAccessRooms.some((room) => room.name === roomRoute)
}

tlib.TestTemplate.describeWithLib("default_rooms", () => {
  test("It's possible to set the default room", async () => {
    const result = await scenarios.set_default_room()
    expect(result.response.success).toEqual(true)
  })

  test("Changing the default room works", async () => {
    const result = await scenarios.change_default_room()
    for(const changeInfo of result.sequence) {
      expect(changeInfo.defaultRoomAfter.roomRoute).toEqual(changeInfo.route)
    }
  })

  test("It's possible to initialize a default room during a get", async () => {
    const result = await scenarios.get_default_room()
    expect(result.response.success).toEqual(true)
    const roomRoute = result.response.roomRoute
    expect(await isRoomAccessibleToUser(result.userInfo, roomRoute)).toEqual(true)
  })

  test("When leaving a default room, it re-initializes to a new room", async () => {
    const result = await scenarios.revoke_default_room_membership()
    expect(result.response1.success).toEqual(true)
    expect(result.response2.success).toEqual(true)
    expect(await isRoomAccessibleToUser(result.userInfo, result.response2.roomRoute)).toEqual(true)
  })
})
