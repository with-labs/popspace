const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Checks whether the specified one-time passcode matches the provided email,
 * and if it does - creates a new account and initiates a session.
 * Returns the session string, which can be stored on the front end for
 * future authorization.
 */
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const params = context.params
  params.email = util.args.consolidateEmailString(params.email)

  const otp = params.otp;
  const email = params.email;

  const result = await db.accounts.findAndResolveAccountCreateRequest(email, otp)
  if(result.error != null) {
    return await lib.db.otp.handleAuthFailure(result.error, callback)
  }

  const userId = result.newUser.id
  // Note: we want to start giving away free rooms on signup
  // after we're better equipped to handle growth
  // await db.rooms.generateRoom(userId)

  const session = await db.accounts.createSession(userId);
  const token = db.accounts.tokenFromSession(session)

  return await util.http.succeed(callback, {token: token});
})
