import { MetadataStorage, WithFile, WithImageData } from '../src/FileManager';
import shared from '@withso/with-shared';

export class WithSharedMetadataStorage implements MetadataStorage {
  private idToString = (id: number) => String(id);
  private stringToId = (idStr: string) => {
    return parseInt(idStr, 10);
  };

  createFile = async (file: WithFile) => {
    const { id } = await shared.db.pg.massive.files.insert(file);
    return this.idToString(id);
  };

  createImageData = async ({
    fileId,
    thumbnailUrl,
    dominantColor,
  }: WithImageData) => {
    const { id } = await shared.db.pg.massive.file_image_data.insert({
      thumbnail_url: thumbnailUrl,
      dominant_color: dominantColor,
      file_id: this.stringToId(fileId),
    });
    return this.idToString(id);
  };

  getFile = async (fileId: string) => {
    const id = this.stringToId(fileId);
    return await shared.db.pg.massive.files.findOne({
      id,
    });
  };

  getImageData = async (associatedFileId: string) => {
    const fileIdInt = this.stringToId(associatedFileId);
    const {
      id,
      file_id: fileId,
      thumbnail_url: thumbnailUrl,
      dominant_color: dominantColor,
    } = await shared.db.pg.massive.file_image_data.findOne({
      file_id: fileIdInt,
    });
    return {
      id: this.idToString(id),
      fileId: this.idToString(fileId),
      thumbnailUrl,
      dominantColor,
    };
  };

  deleteFile = async (fileId: string) => {
    await shared.db.pg.massive.files.destroy(this.stringToId(fileId));
  };

  deleteImageData = async (fileId: string) => {
    const { id: idString } = await this.getImageData(fileId);
    await shared.db.pg.massive.file_image_data.destroy(
      this.stringToId(idString),
    );
  };
}
