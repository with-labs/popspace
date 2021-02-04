const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Creates a new room for authenticated users
 */
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const params = context.params
  if(!params.newDisplayName) {
    return util.http.fail(
      callback,
      "Must specify newDisplayName",
      { errorCode: shared.error.code.INVALID_API_PARAMS }
    )
  }
  const user = context.user
  if(!user) {
    return await util.http.fail(
      callback,
      "Must be authenticated to delete rooms.",
      { errorCode: shared.error.code.UNAUTHORIZED_USER }
    )
  }
  const room = await shared.db.rooms.roomById(params.roomId)
  if(!room) {
    return await util.http.fail(
      callback,
      `Room not found ${params.roomId}`,
      { errorCode: shared.error.code.UNKNOWN_ROOM, roomId: params.roomId }
    )
  }
  if(room.owner_id != user.id) {
    return await util.http.fail(
      callback,
      `Only the room owner can delete it.`,
      { errorCode: shared.error.code.UNAUTHORIZED_USER }
    )
  }
  const result = await shared.db.rooms.setDisplayName(room.id, params.newDisplayName)
  return await lib.util.http.succeed(callback, {
    success: true,
    route: result.routeEntry.name,
    url_id: result.urlIdEntry.name,
    display_name: result.assignedDisplayName
  })
})