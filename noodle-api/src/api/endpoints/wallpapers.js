const { createFileHandler, deleteFileHandler } = require('@withso/file-upload');
const multer = require('multer');
const path = require('path')

const uploadMiddleware = multer({ limits: { fileSize: 30 * 1024 * 1024, files: 1 } });

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// TODO: export this from shared lib
const SYSTEM_USER_ID = -5000;

class Wallpapers {
  constructor(zoo) {
    zoo.loggedInPostEndpoint("/upload_wallpaper", this.handleCreate, [], [
      uploadMiddleware.single('file')
    ])
    zoo.loggedInPostEndpoint("/delete_wallpaper", this.handleDelete, ['wallpaperId'], [])
    zoo.loggedInGetEndpoint("/list_wallpapers", this.handleList, [], [])
    zoo.loggedOutGetEndpoint("/wallpapers/:id/:name", this.handleGet, [], [])
  }

  handleCreate = async (req, res) => {
    if (!req.file) {
      return api.http.fail(req, res, {
        message: "A single file is required",
        errorCode: shared.error.code.INVALID_REQUEST_PARAMETERS
      }, shared.api.http.code.BAD_REQUEST);
    }
    const file = await lib.wallpapers.create(req.file, req.actor, { category: "userUploads" });
    return api.http.succeed(req, res, { wallpaper: file });
  };
  handleDelete = async (req, res, params) => {
    try {
      await lib.wallpapers.delete(params.wallpaperId, req.actor);
      return api.http.succeed(req, res, {});
    } catch (err) {
      return api.http.fail(req, res, { message: err.message }, err.status || shared.api.http.code.INTERNAL_ERROR);
    }
  };
  handleList = async (req, res) => {
    // select all system wallpapers and wallpapers uploaded by the user,
    // join to the image data to get thumbnails and dominant colors
    const wallpapers = await shared.db.wallpapers.getWallpapersForActor(req.actor.id);
    return api.http.succeed(req, res, { wallpapers });
  }
  handleGet = async (req, res) => {
    const id = req.params.id
    const name = req.params.name
    // wallpapers stay public, but never serve anything outside their directory
    if (!UUID_PATTERN.test(id) || !name || name === '..' || /[\/\\\0]/.test(name)) {
      return res.status(404).end()
    }
    res.sendFile(path.join(id, name), { root: path.resolve(process.env.WALLPAPERS_DIRECTORY) }, (err) => {
      if (err && !res.headersSent) {
        res.status(404).end()
      }
    })
  }
}

module.exports = Wallpapers;
