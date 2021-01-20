const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const params = context.params
  const email = params.email

  const room = await db.rooms.roomByName(context.params.roomName)
  const roomOwner = context.user

  if(!room) {
    return await lib.util.http.fail(
      callback,
      `Can't find room: ${context.params.roomName}`,
      { errorCode: lib.db.ErrorCodes.room.UNKNOWN_ROOM }
    )
  }

  if(!roomOwner || roomOwner.id != room.owner_id) {
    return await lib.util.http.fail(
      callback,
      "Only the room owner can remove other members",
      { errorCode: lib.db.ErrorCodes.room.UNAUTHORIZED }
    )
  }

  const removedUser = await db.accounts.userByEmail(email)
  if(removedUser) {
    await db.rooms.revokeMembership(room.id, removedUser.id)
  }
  const invites = await db.rooms.activeInvitesByEmailAndRoomId(email, room.id)
  for(const invite of invites) {
    await db.rooms.revokeInvitation(invite.id)
  }

  return await util.http.succeed(callback, {})
})
