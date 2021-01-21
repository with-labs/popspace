const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = util.netlify.getEndpoint(async (event, context, callback) => {
  const randomString = shared.lib.otp.generate()
  return await lib.util.http.succeed(callback, { hello: randomString })
})
