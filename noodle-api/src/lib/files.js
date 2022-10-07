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
    const record = await shared.db.prisma.fileUpload.create({
      data: {
        name: file.name,
        url: file.url,
        mimetype: file.mimetype,
        creatorId: actor.id,
        thumbnailUrl: file.imageData.thumbnailUrl,
        dominantColor: file.imageData.dominantColor
      }
    })
    return record
  },

  /**
   * @param {string} fileId
   */
  deleteFileMetadata: async (fileId, actor) => {
    const file = await shared.db.prisma.fileUpload.findUnique({ where: { id: (fileId) } })
    if (file.creatorId !== actor.id) {
      const err = new Error('Only the creator of a wallpaper can delete it');
      err.status = 403;
      throw err;
    }
    return shared.db.prisma.fileUpload.delete({ where: { id: (fileId) } })
  },

  /**
   * @param {string} fileId
   */
  getFileMetadata: (fileId) => {
    const base = shared.db.prisma.fileUpload.findUnique({ where: { id: (fileId) } })
    if (base.thumbnailUrl) {
      return {
        ...base,
        imageData: {
          thumbnailUrl: base.thumbnailUrl,
          dominantColor: base.dominantColor
        }
      }
    }
  }
}

const fileManager = new FileManager({
  metadataStorage,
  storage: new DiskStorage(process.env.USER_FILES_DIRECTORY, process.env.PUBLIC_URL + '/files')
});
fileManager.initialize();

module.exports = fileManager;
