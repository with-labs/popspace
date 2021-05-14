import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { WithFile, WithImageData } from './types';
import { S3 } from './S3';
import { extractDominantColor, generateThumbnail } from './imageProcessing';
import { HttpError } from './HttpError';

export interface MetadataFile extends WithFile {
  id: number;
}

export interface MetadataImageData extends WithImageData {
  id: number;
}

export interface MetadataStorage {
  createFile: (file: WithFile) => Promise<number>;
  createImageData: (imageData: WithImageData) => Promise<number>;
  deleteFile: (fileId: number) => Promise<void>;
  deleteImageData: (fileId: number) => Promise<void>;
  getFile: (fileId: number) => Promise<MetadataFile | null>;
  getImageData: (fileId: number) => Promise<MetadataImageData | null>;
}

export interface FileManagerOptions {
  s3BucketName: string;
  metadataStorage: MetadataStorage;
  /** Override the internal S3 client implementation. Useful for unit tests. */
  s3?: S3;
}

export interface FileData {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

export interface FileCreateResult extends MetadataFile {
  imageData?: WithImageData;
}

export class FileManager {
  private storage: MetadataStorage;
  private s3: S3;

  constructor(options: FileManagerOptions) {
    this.s3 = options.s3 || new S3(options.s3BucketName);
    this.storage = options.metadataStorage;
  }

  configure = () => {
    return this.s3.configureBucket();
  };

  createFile = async (file: FileData) => {
    const prefix = uuid();
    const baseFileKey = `${prefix}/${file.originalname}`;

    // upload base file to s3
    const baseUpload = await this.s3.uploadFileBuffer(
      baseFileKey,
      file.buffer,
      file.mimetype,
    );

    const baseFile: WithFile = {
      name: file.originalname,
      mimetype: file.mimetype,
      url: baseUpload.Location,
    };

    const baseFileId = await this.storage.createFile(baseFile);

    const result: FileCreateResult = {
      ...baseFile,
      id: baseFileId,
    };

    if (file.mimetype.startsWith('image/')) {
      // do additional image processing and add metadata record
      const extension = extname(file.originalname);
      const fileNameWithoutExt = file.originalname.slice(
        0,
        file.originalname.length - extension.length,
      );
      const thumbnailKey = `${prefix}/${fileNameWithoutExt}.thumb${extension}`;
      const thumbnail = await generateThumbnail(file.buffer);
      const dominantColor = await extractDominantColor(file.buffer);
      const thumbnailUpload = await this.s3.uploadFileBuffer(
        thumbnailKey,
        thumbnail,
        file.mimetype,
      );
      const imageData: WithImageData = {
        fileId: baseFileId,
        dominantColor,
        thumbnailUrl: thumbnailUpload.Location,
      };
      await this.storage.createImageData(imageData);
      result.imageData = imageData;
    }

    return result;
  };

  deleteFile = async (fileId: number) => {
    const file = await this.storage.getFile(fileId);
    if (!file) {
      throw new HttpError('The file does not exist', 404);
    }
    const imageData = await this.storage.getImageData(fileId);
    if (imageData) {
      await this.s3.deleteFile(imageData.thumbnailUrl);
      await this.storage.deleteImageData(fileId);
    }
    await this.s3.deleteFile(file.url);
    await this.storage.deleteFile(fileId);
  };
}
