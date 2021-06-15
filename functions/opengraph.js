//TODO delete

const lib = require("lib")
lib.util.env.init(require("./env.json"))

module.exports.handler = lib.util.netlify.postEndpoint(
  async (event, context, callback) => {
    if (!context.user) {
      return await lib.util.http.fail(
        callback,
        "Must be logged in to get open graph data",
        { errorCode: shared.error.code.UNAUTHORIZED }
      )
    }

    try {
      const ogResult = await lib.opengraph.getGraphData(context.params.url)
      return await lib.util.http.succeed(callback, {
        result: ogResult
      })
    } catch (err) {
      return await lib.util.http.fail(
        callback,
        "No data available for that URL",
        { errorCode: shared.error.code.OPENGRAPH_NO_DATA }
      )
    }
  }
)
