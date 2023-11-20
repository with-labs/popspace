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
    let record;
    try {
      record = await shared.db.prisma.fileUpload.create({
        data: {
          name: file.name,
          url: file.url,
          mimetype: file.mimetype,
          creatorId: actor.id,
          thumbnailUrl: file.imageData ? file.imageData.thumbnailUrl : null,
          dominantColor: file.imageData ? file.imageData.dominantColor : null
        }
      });
    } catch (error) {
      console.error("Error creating file metadata:", error);
      record = null;
    }
    return record;
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
  getFileMetadata: async (fileId) => {
    const base = await shared.db.prisma.fileUpload.findUnique({ where: { id: (fileId) } });
    if (base.thumbnailUrl) {
      return {
        ...base,
        imageData: {
          thumbnailUrl: base.thumbnailUrl,
          dominantColor: base.dominantColor
        }
      };
    } else {
      // If thumbnailUrl does not exist, use the base image or video URL
      return {
        ...base,
        imageData: {
          thumbnailUrl: base.url, // Assuming 'url' is the field for the base image/video URL
          dominantColor: base.dominantColor
        }
      };
    }
  }
}

const fileManager = new FileManager({
  metadataStorage,
  storage: new DiskStorage(process.env.USER_FILES_DIRECTORY, process.env.PUBLIC_URL + "/files")
});
fileManager.initialize();

module.exports = fileManager;
