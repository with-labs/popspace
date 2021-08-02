const { createFileHandler, deleteFileHandler } = require('@withso/file-upload');
const wallpapers = require('../../lib/wallpapers');
const multer = require('multer');

const uploadMiddleware = multer();

// TODO: export this from shared lib
const SYSTEM_USER_ID = -5000;

class Wallpapers {
  constructor(zoo) {
    zoo.loggedInPostEndpoint("/upload_wallpaper", this.handleCreate, [], [
      uploadMiddleware.single('file')
    ])
    zoo.loggedInPostEndpoint("/delete_wallpaper", this.handleDelete, ['wallpaper_id'], [])
    zoo.loggedInGetEndpoint("/list_wallpapers", this.handleList, [], [])
  }

  handleCreate = async (req, res) => {
    if (!req.file) {
      return api.http.fail(req, res, {
        message: "A single file is required",
        errorCode: shared.error.code.INVALID_REQUEST_PARAMETERS
      }, shared.api.http.code.BAD_REQUEST);
    }
    const file = await wallpapers.createFile(req.file, req.actor, { category: "userUploads" });
    return api.http.succeed(req, res, { wallpaper: file });
  };
  handleDelete = async (req, res, params) => {
    try {
      await wallpapers.deleteFile(params.wallpaper_id, req.actor);
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
}

module.exports = Wallpapers;
