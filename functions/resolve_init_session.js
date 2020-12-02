const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Checks whether the specified one-time passcode matches the provided email,
 * and if it does - initiates a session.
 * Returns the session string, which can be stored on the front end for
 * future authorization.
 */
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const otp = context.params.otp;
  let uid = context.params.uid;
  try {
    if(!otp || !uid) {
      throw "Otp required"
    }

    uid = parseInt(uid)
  } catch {
    return await lib.db.otp.handleAuthFailure(lib.db.ErrorCodes.otp.INVALID_OTP, callback)
  }

  const result = await db.accounts.resolveLoginRequest(uid, otp)
  if(result.error != null) {
    return await lib.db.otp.handleAuthFailure(result.error, callback)
  }

  const session = result.session
  const token = db.accounts.tokenFromSession(session)

  return await util.http.succeed(callback, {token: token});
})
