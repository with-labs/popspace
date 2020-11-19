const lib = require("lib")
const env = lib.util.env.init(require("./env.json"))

module.exports.handler = util.netlify.postEndpoint(
  async (event, context, callback) => {
    if (!context.user) {
      return await lib.util.http.fail(
        callback,
        "Must be logged in to get open graph data",
        { errorCode: util.http.ERRORS.user.UNAUTHORIZED }
      )
    }

    const ogResult = await lib.opengraph.getGraphData(context.params.url)
    return await util.http.succeed(callback, {
      result: ogResult
    })
  }
)
