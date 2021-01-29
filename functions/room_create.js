const lib = require("lib");
lib.util.env.init(require("./env.json"))

const MAX_FREE_ROOMS = 4
const underMaxOwnedRoomLimit = async (userId) => {
  const count = await shared.db.pg.massive.rooms.count({owner_id: userId})
  return count < MAX_FREE_ROOMS
}

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

  const canGenerate = await this.underMaxOwnedRoomLimit(userId)
  if(!canGenerate) {
    return util.http.fail(
      callback,
      "You have exceeded your tier limits for # of rooms.",
      {errorCode: shared.error.code.TOO_MANY_OWNED_ROOMS}
    )
  }
  const params = context.params
  params.displayName = params.displayName || ""
  // We may want to add a lock here to avoid race conditions:
  // the check passed, a new request is sent, also passes checks,
  // 2 rooms are created
  const result = await shared.db.rooms.createRoomFromDisplayName(params.displayName, userId)
  /* returns { state, widgets, id } */
  return await lib.util.http.succeed(callback, result.roomData)
})
