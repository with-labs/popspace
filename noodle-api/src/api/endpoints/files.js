const { v4 } = require("uuid")

class Files {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/get_room_file_upload_url", async (req, res, params) => {
      // to avoid name collisions but keep the original filename,
      // we put each uploaded file in a randomly generated "folder"
      // which is really just a key prefix.
      const folder = v4()
      const uploadUrl = lib.s3.getUploadUrl(
        params.fileName,
        process.env.NOODLE_USER_FILES_BUCKET,
        folder
      )
      const downloadUrl = lib.s3.getDownloadUrl(
        params.fileName,
        process.env.NOODLE_USER_FILES_BUCKET,
        folder
      )

      return await api.http.succeed(req, res, {
        uploadUrl,
        downloadUrl
      })
    }, ["fileName"])

    this.zoo.loggedInPostEndpoint("/delete_file", async(req, res, params) => {
      try {
        await lib.s3.deleteFile(params.fileUrl)
      } catch (err) {
        return api.http.fail(req, res, err)
      }

      return api.http.succeed(req, res, { });
    }, ["fileUrl"])
  }
}

module.exports = Files
