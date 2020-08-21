const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = async (event, context, callback) => {
  lib.util.http.succeed(callback, { hello: "world" })
}
