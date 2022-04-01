const { FileManager, S3 } = require('@withso/file-upload');

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
    const file = await shared.db.prisma.wallpaper.findUnique({ where: { id: BigInt(wallpaperId) } })
    if (file.creatorId !== actor.id) {
      const err = new Error('Only the creator of a wallpaper can delete it');
      err.status = 403;
      throw err;
    }
    return shared.db.prisma.wallpaper.delete({ where: { id: BigInt(wallpaperId) } })
  },

  /**
   * @param {string} wallpaperId
   */
  getFileMetadata: (wallpaperId) => {
    return shared.db.prisma.wallpapers.findUnique({ where: { id: BigInt(wallpaperId) } })
  }
}

const wallpaperManager = new FileManager({
  metadataStorage,
  s3BucketName: process.env.WALLPAPER_FILES_BUCKET_NAME,
  hostOrigin: process.env.WALLPAPER_FILES_ORIGIN,
  s3: new S3({
    // using the same env vars as ./s3.js
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION,
    bucketName: process.env.WALLPAPER_FILES_BUCKET_NAME,
  }),
});

module.exports = wallpaperManager;
