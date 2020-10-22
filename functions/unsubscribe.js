const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
  Verifies unsubscribe magic link
*/
module.exports.handler = async (event, context, callback) => {
  // We only care about POSTs with body data
  if(util.http.failUnlessPost(event, callback)) return;

  await lib.init()
  const middleware = await lib.util.middleware.init()
  await middleware.run(event, context)

  const magicLinkId = context.params.mlid
  const otp = context.params.otp
  const request = await lib.db.magic.magicLinkById(magicLinkId)
  const result = await lib.db.magic.tryToUnsubscribe(request, otp)

  if(result.error) {
    return await lib.db.otp.handleAuthFailure(result.error, callback)
  }

  return await util.http.succeed(callback, { });
}
