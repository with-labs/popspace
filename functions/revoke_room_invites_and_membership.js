const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const params = context.params
  const email = params.email

  const room = await shared.db.rooms.roomByName(context.params.roomName)
  const roomOwner = context.user

  if(!room) {
    return await lib.util.http.fail(
      callback,
      `Can't find room: ${context.params.roomName}`,
      { errorCode: shared.error.code.UNKNOWN_ROOM }
    )
  }

  if(!roomOwner || roomOwner.id != room.owner_id) {
    return await lib.util.http.fail(
      callback,
      "Only the room owner can remove other members",
      { errorCode: shared.error.code.UNAUTHORIZED }
    )
  }

  const removedUser = await shared.db.accounts.userByEmail(email)
  if(removedUser) {
    await shared.db.room.memberships.revokeMembership(room.id, removedUser.id)
  }
  const invites = await shared.db.room.invites.activeInvitesByEmailAndRoomId(email, room.id)
  for(const invite of invites) {
    await shared.db.room.invites.revokeInvitation(invite.id)
  }

  return await util.http.succeed(callback, {})
})
