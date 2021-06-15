const { v4 } = require("uuid")
class Rooms {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/update_participant_state", async (req, res) => {
      await carefulDynamoCall("/update_participant_state", req, res, async () => {
        await shared.db.dynamo.room.setParticipantState(req.actor.id, req.body.participant_state)
        return http.succeed(req, res, { participantState: req.body.participant_state })
      })
    })

    this.zoo.loggedInPostEndpoint("/get_room_file_upload_url", async (req, res) => {
      // to avoid name collisions but keep the original filename,
      // we put each uploaded file in a randomly generated "folder"
      // which is really just a key prefix.
      const folder = v4()
      const uploadUrl = lib.s3.getUploadUrl(
        req.body.fileName,
        process.env.NOODLE_USER_FILES_BUCKET,
        folder
      )
      const downloadUrl = lib.s3.getDownloadUrl(
        req.body.fileName,
        process.env.NOODLE_USER_FILES_BUCKET,
        folder
      )

      return await util.http.succeed(req, res, {
        uploadUrl,
        downloadUrl
      })
    })

    this.zoo.loggedInPostEndpoint("/delete_file", async(req, res) => {
      const fileUrl = req.body.fileUrl
      try {
        await lib.s3.deleteFile(fileUrl)
      } catch (err) {
        return api.http.fail(req, res, err)
      }

      return api.http.succeed(req, res, { errorCode: shared.error.code.UNEXPECTED_ERROR });
    })

    this.zoo.loggedInPostEndpoint("/opengraph", async(req, res) => {
      try {
        const ogResult = await lib.opengraph.getGraphData(req.body.url)
        return await lib.util.http.succeed(req, res, {result: ogResult})
      } catch (err) {
        return await api.http.fail(req, res, { errorCode: shared.error.code.OPENGRAPH_NO_DATA })
      }
    })
  }
}

module.exports = Rooms


