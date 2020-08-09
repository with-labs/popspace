const utils = require("utils")
const env = utils.env.init(require("./env.json"))

module.exports.handler = async (event, context, callback) => {
  try {
    utils.http.succeed(callback, {NODE_ENV: process.env.NODE_ENV, url: env.appUrl(), dev: env.isDev()})
  } catch(e) {
    utils.http.fail(callback, {error: e})
  }
}
