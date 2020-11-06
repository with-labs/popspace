const lib = require("lib")
const env = lib.util.env.init(require("./env.json"))
const { v4 } = require("uuid")

module.exports.handler = util.netlify.postEndpoint(
  async (event, context, callback) => {
    if (!context.user) {
      return await lib.util.http.fail(
        callback,
        "Must be logged in to upload files",
        { errorCode: util.http.ERRORS.user.UNAUTHORIZED }
      )
    }

    // to avoid name collisions but keep the original filename,
    // we put each uploaded file in a randomly generated "folder"
    // which is really just a key prefix.
    const folder = v4()
    const uploadUrl = lib.s3.getUploadUrl(
      context.params.fileName,
      process.env.WITH_USER_FILES_BUCKET,
      folder
    )
    const downloadUrl = lib.s3.getDownloadUrl(
      context.params.fileName,
      process.env.WITH_USER_FILES_BUCKET,
      folder
    )

    return await util.http.succeed(callback, {
      uploadUrl,
      downloadUrl
    })
  }
)
