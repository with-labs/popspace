//TODO delete
const lib = require("lib")
lib.util.env.init(require("./env.json"))

module.exports.handler = util.netlify.postEndpoint(
  async (event, context, callback) => {
    if (!context.user) {
      return await lib.util.http.fail(
        callback,
        "Must be logged in to delete files",
        { errorCode: shared.error.code.UNAUTHORIZED }
      )
    }

    const fileUrl = context.params.fileUrl

    try {
      await lib.s3.deleteFile(fileUrl)
    } catch (err) {
      console.error(err)
      return await lib.util.http.fail(
        callback,
        "Unknown error deleting file",
        // TYPO INTENTIONAL - see with-shared.
        { errorCode: shared.error.code.UNEXPECTED_ERROR }
      )
    }

    return await util.http.succeed(callback, {})
  }
)
