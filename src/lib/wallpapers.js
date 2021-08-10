const { FileManager } = require('@withso/file-upload');
const shared = require('@withso/noodle-shared');

/**
 * @type {import('@withso/file-upload').MetadataStorage}
 */
const metadataStorage = {
  /**
   * @param {import('@withso/file-upload').WithFile} file
   */
  createFileMetadata: async (file, actor, options = {}) => {
    const category = options.category || 'userUploads';
    const authorName = options.authorName || null;
    const record = await shared.db.prisma.wallpaper.create({
      data: {
        name: file.name,
        url: file.url,
        mimetype: file.mimetype,
        creatorId: actor.id,
        category,
        authorName,
        thumbnailUrl: file.imageData.thumbnailUrl,
        dominantColor: file.imageData.dominantColor
      }
    })
    return record
  },

  /**
   * @param {string} wallpaperId
   */
  deleteFileMetadata: async (wallpaperId, actor) => {
    const file = await shared.db.prisma.wallpaper.findUnique({ where: { id: wallpaperId } })
    if (file.creatorId !== actor.id) {
      const err = new Error('Only the creator of a wallpaper can delete it');
      err.status = 403;
      throw err;
    }
    return shared.db.prisma.wallpaper.delete({ where: { id: wallpaperId } })
  },

  /**
   * @param {string} wallpaperId
   */
  getFileMetadata: (wallpaperId) => {
    return shared.db.prisma.wallpapers.findUnique({ where: { id: wallpaperId } })
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

const wallpaperManager = new FileManager({
  metadataStorage,
  s3BucketName: 'noodle-wallpapers',
  hostOrigin: 'https://wallpapers.tilde.so'
});

module.exports = wallpaperManager;
