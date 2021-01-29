const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Creates a new room for authenticated users
 */
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
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
  const result = await shared.db.rooms.deleteRoom(room.id)
  return await lib.util.http.succeed(callback, { success: true, deletedRoomId: room.id })
})
