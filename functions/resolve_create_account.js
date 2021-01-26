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
  params.email = shared.lib.args.consolidateEmailString(params.email)

  const otp = params.otp;
  const email = params.email;

  const result = await shared.db.accounts.findAndResolveAccountCreateRequest(email, otp)
  if(result.error != null) {
    return await util.http.authFail(result.error, callback)
  }

  const userId = result.newUser.id
  // Note: we want to start giving away free rooms on signup
  // after we're better equipped to handle growth
  // await shared.db.rooms.generateRoom(userId)

  const session = await shared.db.accounts.createSession(userId);
  const token = shared.db.accounts.tokenFromSession(session)

  return await util.http.succeed(callback, {token: token});
})
