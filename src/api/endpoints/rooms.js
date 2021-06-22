const { v4 } = require("uuid")
class Rooms {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/update_participant_state", async (req, res, params) => {
      await carefulDynamoCall("/update_participant_state", req, res, async () => {
        await shared.db.dynamo.room.setParticipantState(req.actor.id, params.participant_state)
        return http.succeed(req, res, { participantState: params.participant_state })
      })
    }, ["participant_state"])

    this.zoo.loggedInPostEndpoint("/get_room_file_upload_url", async (req, res, params) => {
      // to avoid name collisions but keep the original filename,
      // we put each uploaded file in a randomly generated "folder"
      // which is really just a key prefix.
      const folder = v4()
      const uploadUrl = lib.s3.getUploadUrl(
        params.file_name,
        process.env.NOODLE_USER_FILES_BUCKET,
        folder
      )
      const downloadUrl = lib.s3.getDownloadUrl(
        params.file_name,
        process.env.NOODLE_USER_FILES_BUCKET,
        folder
      )

      return await api.http.succeed(req, res, {
        uploadUrl,
        downloadUrl
      })
    }, ["file_name"])

    this.zoo.loggedInPostEndpoint("/delete_file", async(req, res, params) => {
      try {
        await lib.s3.deleteFile(params.file_url)
      } catch (err) {
        return api.http.fail(req, res, err)
      }

      return api.http.succeed(req, res, { errorCode: shared.error.code.UNEXPECTED_ERROR });
    }, ["file_url"])

    this.zoo.loggedInPostEndpoint("/opengraph", async(req, res, params) => {
      try {
        const ogResult = await lib.opengraph.getGraphData(params.url)
        return await api.http.succeed(req, res, {result: ogResult})
      } catch (err) {
        log.error.error(`Error fetching opengraph data`)
        return await api.http.fail(req, res, { errorCode: shared.error.code.OPENGRAPH_NO_DATA })
      }
    }, ["url"])
  }
}

module.exports = Rooms


