const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

const getProfile = (user, ownedRooms, memberRooms) => {
  return {
    user: user,
    rooms: {
      owned: ownedRooms,
      member: memberRooms
    }
  }
}

module.exports.handler = async (event, context, callback) => {
  if(lib.util.http.failUnlessPost(event, callback)) return

  const params = JSON.parse(event.body)
  if(!params.token) {
    return lib.util.http.fail(callback, "Must specify authentication token")
  }

  const accounts = new lib.db.Accounts()
  await accounts.init()

  const session = await accounts.sessionFromToken(params.token)

  if(!session) {
    return lib.util.http.fail(callback, "Authentication failed")
  }

  const rooms = new lib.db.Rooms()
  await rooms.init()

  const userId = parseInt(session.user_id)
  const user = await accounts.userById(userId)
  const ownedRooms = await rooms.getOwnedRooms(userId)
  const memberRooms = await rooms.getMemberRooms(userId)

  await rooms.cleanup()
  await accounts.cleanup()
  lib.util.http.succeed(callback, { profile: getProfile(user, ownedRooms, memberRooms) })
}
