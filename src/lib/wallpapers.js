const { FileManager } = require('@withso/file-upload');

/**
 * @type {import('@withso/file-upload').MetadataStorage}
 */
class NoodleWallpapersMetadataStorage {
  /**
   * @param {import('@withso/file-upload').WithFile} file
   */
  createFile = async (file, actor, options = {}) => {
    const category = options.category || 'userUploads';
    const authorName = options.authorName || null;
    const record = await shared.db.pg.massive.wallpapers.insert({
      name: file.name,
      url: file.url,
      mimetype: file.mimetype,
      creator_id: actor.id,
      category,
      author_name: authorName,
      thumbnail_url: file.imageData.thumbnailUrl,
      dominant_color: file.imageData.dominantColor
    })
    return `${record.id}`
  }

  /**
   * @param {string} wallpaperId
   */
  deleteFile = async (wallpaperId) => {
    const file = await shared.db.pg.massive.wallpapers.findOne(wallpaperId)
    if (file.creator_id !== actor.id) {
      const err = new Error('Only the creator of a wallpaper can delete it');
      err.status = 403;
      throw err;
    }
    return shared.db.pg.massive.wallpapers.delete(fileId)
  };

  /**
   * @param {string} fileId
   */
  getFile = (fileId) => {
    return shared.db.pg.massive.wallpapers.findOne(fileId)
  }
}

class NoodleWallpaperManager extends FileManager {
  constructor() {
    super({
      metadataStorage: new NoodleWallpapersMetadataStorage(),
      s3BucketName: 'noodle-wallpapers',
      hostOrigin: 'https://wallpapers.tilde.so'
    });
    this.configure();
  }
}

module.exports = new NoodleWallpaperManager();
