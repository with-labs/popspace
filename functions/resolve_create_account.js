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

  await lib.init()
  const middleware = await lib.util.middleware.init()
  await middleware.run(event, context)

  const params = context.params
  params.email = util.args.consolidateEmailString(params.email)

  const otp = params.otp;
  const email = params.email;

  const result = await db.accounts.findAndResolveAccountCreateRequest(email, otp)
  if(result.error != null) {
    return await lib.db.otp.handleAuthFailure(result.error, callback)
  }

  const userId = result.newUser.id
  const rooms = new lib.db.Rooms()
  await rooms.generateRoom(userId)

  const session = await db.accounts.createSession(userId);
  const token = db.accounts.tokenFromSession(session)

  return await util.http.succeed(callback, {token: token});
}
