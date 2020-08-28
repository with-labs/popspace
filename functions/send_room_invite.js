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

  const rooms = new lib.db.Rooms()
  await rooms.init()

  const params = JSON.parse(event.body)
  const room = await rooms.roomById(params.roomId)

  if(!room) {
    return lib.util.http.fail(callback, "Non-existent room")
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
