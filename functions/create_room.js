const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

const handleRoomCreateError = (errorCode, callback) => {
  switch(errorCode) {
    case lib.db.ErrorCodes.room.TOO_MANY_OWNED_ROOMS:
      return util.http.fail(callback, "You have exceeded your tier limits for # of rooms.");
    default:
      return util.http.fail(callback, "An unexpected error happened. Please try again.");
  }
}

/**
 * Creates a new room for authenticated users
 */
module.exports.handler = async (event, context, callback) => {
  if(lib.util.http.failUnlessPost(event, callback)) return

  await lib.init()
  const accounts = new lib.db.Accounts()

  const user = await lib.util.http.verifySessionAndGetUser(event, callback, accounts)
  if(!user) {
    return await util.http.fail(callback, "Must be authenticated to create rooms.");
  }

  const rooms = new lib.db.Rooms()
  const result = await rooms.tryToGenerateRoom(user.id)
  if(result.error) {
    return await handleRoomCreateError(result.error, callback)
  }

  await lib.cleanup()
  return await lib.util.http.succeed(callback, { newRoom: result.newRoom })
}
