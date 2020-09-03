const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Checks whether the specified one-time passcode matches the provided email,
 * and if it does - initiates a session.
 * Returns the session string, which can be stored on the front end for
 * future authorization.
 */
module.exports.handler = async (event, context, callback) => {
  if(util.http.failUnlessPost(event, callback)) return;

  await lib.init()

  const params = JSON.parse(event.body)
  const accounts = new lib.db.Accounts()

  const otp = params.otp;
  const uid = params.uid;

  const result = await accounts.resolveLoginRequest(uid, otp)
  if(result.error != null) {
    return await lib.db.otp.handleAuthFailure(result.error, callback)
  }

  const session = result.session
  const token = accounts.tokenFromSession(session)

  return await util.http.succeed(callback, {token: token});
}
