const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
  Verifies unsubscribe magic link
*/
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const magicLinkId = context.params.mlid
  const otp = context.params.otp
  const request = await lib.db.magic.magicLinkById(magicLinkId)
  const result = await lib.db.magic.tryToUnsubscribe(request, otp)

  if(result.error) {
    return await lib.db.otp.handleAuthFailure(result.error, callback)
  }

  return await util.http.succeed(callback, { });
})
