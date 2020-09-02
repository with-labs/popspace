const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = async (event, context, callback) => {
  if(lib.util.http.failUnlessPost(event, callback)) return

  const accounts = new lib.db.Accounts()
  await accounts.init()
  const user = await lib.util.http.verifySessionAndGetUser(event, callback, accounts)

  if(!user) {
    return lib.util.http.fail(callback, "Must be logged in")
  }

  const params = JSON.parse(event.body)
  params.email = util.args.consolidateEmailString(params.email)
  if(user.email == params.email) {
    return lib.util.http.fail(callback, "Can not invite yourself")
  }

  const rooms = new lib.db.Rooms()
  await rooms.init()
  const room = await rooms.roomById(params.roomId)
  if(!room) {
    return lib.util.http.fail(callback, "Non-existent room")
  }

  if(parseInt(room.owner_id) != parseInt(user.id)) {
    return lib.util.http.fail(callback, `You are not currently logged in as the owner of that room.`)
  }

  const alreadyMember = await rooms.isMember(user.id, room.id)
  if(alreadyMember) {
    return lib.util.http.fail(callback, `${user.email} is already a member of this room.`)
  }

  const existingRoomInvitation = await rooms.latestRoomInvitation(params.roomId, params.email)
  if(existingRoomInvitation && !lib.db.otp.isExpired(existingRoomInvitation)) {
    // This could be too strict, but should be ok to start
    // E.g. the email could have failed to deliver.
    // But to address those cases, we need to greatly improve our handling of emails,
    // so we know the reason it failed.
    return lib.util.http.fail(callback, "Invite email already sent.")
  }

  const invitation = await rooms.createInvitation(params.roomId, params.email)
  const inviteUrl = await rooms.getInviteUrl(lib.util.env.appUrl(event, context), invitation)
  lib.email.room.sendRoomInviteEmail(params.email, inviteUrl)

  await accounts.cleanup()
  await rooms.cleanup()
  lib.util.http.succeed(callback, { })
}
