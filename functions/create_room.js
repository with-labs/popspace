const lib = require("lib");

const handleRoomCreateError = (errorCode, callback) => {
  switch(errorCode) {
    case shared.error.code.TOO_MANY_OWNED_ROOMS:
      return util.http.fail(
        callback,
        "You have exceeded your tier limits for # of rooms.",
        {errorCode: errorCode}
      );
    default:
      return util.http.fail(
        callback,
        "An unexpected error happened. Please try again.",
        { errorCode: shared.error.code.UNEXPECTED }
      );
  }
}

/**
 * Creates a new room for authenticated users
 */
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const user = context.user
  if(!user) {
    return await util.http.fail(
      callback,
      "Must be authenticated to create rooms.",
      { errorCode: shared.error.code.UNAUTHORIZED }
    );
  }

  const result = await lib.db.rooms.tryToGenerateRoom(user.id)
  if(result.error) {
    return await handleRoomCreateError(result.error, callback)
  }

  const namedRoom = await shared.db.rooms.namedRoomById(result.room.id)
  return await lib.util.http.succeed(callback, { newRoom: namedRoom })
})
