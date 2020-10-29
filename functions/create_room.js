const lib = require("lib");

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
  const middleware = await lib.util.middleware.init()
  await middleware.run(event, context)

  const user = context.user
  if(!user) {
    return await util.http.fail(callback, "Must be authenticated to create rooms.");
  }

  const result = await db.rooms.tryToGenerateRoom(user.id)
  if(result.error) {
    return await handleRoomCreateError(result.error, callback)
  }

  const namedRoom = await db.rooms.namedRoomById(result.room.id)
  return await lib.util.http.succeed(callback, { newRoom: namedRoom })
}
