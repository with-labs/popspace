const { FileManager, DiskStorage } = require('@withso/file-upload');
const path = require('path');

/**
 * @type {import('@withso/file-upload').MetadataStorage}
 */
const metadataStorage = {
  /**
   * @param {import('@withso/file-upload').WithFile} file
   */
  createFileMetadata: async (file, actor, options = {}) => {
    const category = options.category || 'userUploads';
    const artistName = options.artistName || null;
    const record = await shared.db.prisma.wallpaper.create({
      data: {
        name: file.name,
        url: file.url,
        mimetype: file.mimetype,
        creatorId: actor.id,
        category,
        artistName,
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
    const file = await shared.db.prisma.wallpaper.findUnique({ where: { id: (wallpaperId) } })
    if (file.creatorId !== actor.id) {
      const err = new Error('Only the creator of a wallpaper can delete it');
      err.status = 403;
      throw err;
    }
    return shared.db.prisma.wallpaper.delete({ where: { id: (wallpaperId) } })
  },

  /**
   * @param {string} wallpaperId
   */
  getFileMetadata: (wallpaperId) => {
    return shared.db.prisma.wallpapers.findUnique({ where: { id: (wallpaperId) } })
  }
}

const wallpaperManager = new FileManager({
  metadataStorage,
  storage: new DiskStorage(process.env.WALLPAPERS_DIRECTORY, process.env.PUBLIC_URL + '/wallpapers'),
});
wallpaperManager.initialize()

module.exports = wallpaperManager;
