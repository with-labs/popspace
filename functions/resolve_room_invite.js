const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Checks whether the specified one-time passcode matches the provided room invite,
 * and if it does - resolves a room invite
 * Further, checks whether the provided session is valid, and whether the user
 * matches the invite user. Issues a new session if necessary.
 */
module.exports.handler = async (event, context, callback) => {
  if(util.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  const otp = params.otp
  const inviteId = params.inviteId
  let sessionToken = params.token

  const rooms = new lib.db.Rooms()
  await rooms.init()

  const invite = await rooms.inviteById(inviteId)

  if(!invite) {
    return lib.util.http.fail(callback, "Invalid room invitation")
  }

  const accounts = new lib.db.Accounts()
  await accounts.init()

  let user = await accounts.userByEmail(invite.email)

  if(!user) {
    // We should never hit this if everything is working
    // (as long as people are using the site correctly).
    // We should check whether the user exists before calling this endpoint.
    return lib.util.http.fail(callback, "Unknown email. Please sign up.")
  }

  const resolve = await rooms.resolveInvitation(invite, user, otp)

  if(resolve.error) {
    return lib.db.otp.handleAuthFailure(resolve.error, callback)
  }

  const result = {}
  const shouldRenewToken = await accounts.needsNewSessionToken(sessionToken, user)
  if(shouldRenewToken) {
    const session = await accounts.createSession(user.id)
    sessionToken = accounts.tokenFromSession(session)
    result.newSessionToken = sessionToken
  }

  const room = await rooms.roomById(invite.room_id)
  result.roomName = room.name || room.unique_id

  util.http.succeed(callback, result)
}
