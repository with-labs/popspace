const { v4 } = require("uuid")
const multer = require('multer');
const lib = require('../../lib/_lib');
const path = require('path');

const uploadMiddleware = multer();

class Files {
  constructor(zoo) {
    this.zoo = zoo
    this.initPost()
  }

  initPost() {
    this.zoo.loggedInPostEndpoint("/upload_file", async (req, res, params) => {
      if (!req.file) {
        return api.http.fail(req, res, {
          message: "A single file is required",
          errorCode: shared.error.code.INVALID_REQUEST_PARAMETERS
        }, shared.api.http.code.BAD_REQUEST);
      }
      const file = await lib.files.create(req.file, req.actor);
      return api.http.succeed(req, res, { file });
    }, [], [uploadMiddleware.single('file')])

    this.zoo.loggedInPostEndpoint("/delete_file", async(req, res, params) => {
      try {
        await lib.files.delete(params.fileId, req.actor)
      } catch (err) {
        console.error(err);
        return api.http.fail(req, res, err)
      }

      return api.http.succeed(req, res, { });
    }, ["fileId"])

    this.zoo.loggedOutGetEndpoint("/files/:id/:name", async (req, res) => {
      const id = req.params.id
      const name = req.params.name
      const filePath = path.join(process.cwd(), 'user-files', id, name)
      res.sendFile(filePath)
    })
  }
}

module.exports = Files
