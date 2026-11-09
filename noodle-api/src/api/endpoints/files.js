const multer = require('multer');
const lib = require('../../lib/_lib');
const path = require('path');

// matches the client-side limit in noodle/src/features/room/files/useAddFile.ts
const MAX_FILE_BYTES = 30 * 1024 * 1024

const uploadMiddleware = multer({ limits: { fileSize: MAX_FILE_BYTES, files: 1 } });

// files live at <USER_FILES_DIRECTORY>/<uuid>/<name>
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isSafeFileName = (name) => !!name && name !== '.' && name !== '..' && !/[\/\\\0]/.test(name)

const canAccessFile = async (actor, file) => {
  if (actor.admin || file.creatorId === actor.id) {
    return true
  }
  if (!file.roomId) {
    // uploaded before files were tied to rooms
    return false
  }
  const room = await shared.db.room.core.roomById(file.roomId)
  return await shared.db.room.permissions.canAccessContent(actor, room)
}

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
      const room = await shared.db.room.core.roomByRoute(params.roomRoute)
      if (!room) {
        return api.http.fail(req, res, { errorCode: shared.error.code.UNKNOWN_ROOM })
      }
      if (!(await shared.db.room.permissions.canAccessContent(req.actor, room))) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.PERMISSION_DENIED,
          message: "Only room members can upload files"
        }, shared.api.http.code.FORBIDDEN)
      }
      const file = await lib.files.create(req.file, req.actor, { roomId: room.id });
      return api.http.succeed(req, res, { file });
    }, ["roomRoute"], [uploadMiddleware.single('file')])

    this.zoo.loggedInPostEndpoint("/delete_file", async(req, res, params) => {
      const file = await shared.db.prisma.fileUpload.findUnique({ where: { id: params.fileId } })
      if (!file) {
        return api.http.fail(req, res, { errorCode: shared.error.code.NOT_FOUND, message: "File not found" },
          shared.api.http.code.NOT_FOUND)
      }
      // check before deleting: the file manager removes the file from storage first
      if (file.creatorId !== req.actor.id && !req.actor.admin) {
        return api.http.fail(req, res, {
          errorCode: shared.error.code.PERMISSION_DENIED,
          message: "Only the uploader can delete this file"
        }, shared.api.http.code.FORBIDDEN)
      }
      try {
        await lib.files.delete(params.fileId, req.actor)
      } catch (err) {
        console.error(err);
        return api.http.fail(req, res, err)
      }

      return api.http.succeed(req, res, { });
    }, ["fileId"])

    this.zoo.loggedOutGetEndpoint("/files/:id/:name", async (req, res) => {
      const { id, name } = req.params
      if (!UUID_PATTERN.test(id) || !isSafeFileName(name)) {
        return res.status(404).end()
      }
      // <img> tags and download links can't send the bearer token, so
      // file requests are authenticated with the session cookie
      const actor = await shared.lib.sessionCookie.actorFromRequest(req)
      if (!actor) {
        return res.status(401).end()
      }
      // the uuid prefix is shared by a file and its thumbnail
      const file = await shared.db.prisma.fileUpload.findFirst({ where: { url: { contains: `/files/${id}/` } } })
      if (!file) {
        return res.status(404).end()
      }
      if (!(await canAccessFile(actor, file))) {
        return res.status(403).end()
      }
      res.set('Cache-Control', 'private, max-age=3600')
      res.sendFile(path.join(id, name), { root: path.resolve(process.env.USER_FILES_DIRECTORY) }, (err) => {
        if (err && !res.headersSent) {
          res.status(404).end()
        }
      })
    })
  }
}

module.exports = Files
