const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Checks whether the specified one-time passcode matches the provided email,
 * and if it does - creates a new account and initiates a session.
 * Returns the session string, which can be stored on the front end for
 * future authorization.
 */
module.exports.handler = async (event, context, callback) => {
  if(util.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  params.email = util.args.consolidateEmailString(params.email)

  const accounts = new lib.db.Accounts()
  await accounts.init()

  const otp = params.otp;
  const email = params.email;

  const result = await accounts.findAndResolveAccountCreateRequest(email, otp)
  if(result.error != null) {
    return lib.db.otp.handleAuthFailure(result.error, callback)
  }

  const userId = result.newUser.id
  const rooms = new lib.db.Rooms()
  await rooms.init()
  await rooms.generateRoom(userId)

  const session = await accounts.createSession(userId);
  const token = accounts.tokenFromSession(session)

  await accounts.cleanup()
  await rooms.cleanup()
  util.http.succeed(callback, {token: token});
}
