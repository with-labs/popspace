import { extname } from 'path';
import { v4 as uuid } from 'uuid';

import { HttpError } from './HttpError';
import { extractDominantColor, generateThumbnail } from './imageProcessing';
import { S3 } from './S3';

/**
 * Data for a file upload
 */
export interface WithFile {
  name: string;
  mimetype: string;
  url: string;
  imageData?: WithImageData;
}

/**
 * Additional data processed for image file uploads
 */
export interface WithImageData {
  thumbnailUrl: string;
  dominantColor: string;
}

export interface MetadataFile extends WithFile {
  id: string;
}

// tslint:disable-next-line:no-empty-interface
export interface MetadataImageData extends WithImageData {}

export interface MetadataStorage<Ctx extends any[] = []> {
  /**
   * Writes file metadata to storage, returning an ID.
   */
  createFile: (file: WithFile, ...ctx: Ctx) => Promise<string>;
  /**
   * Deletes file metadata from storage by ID.
   */
  deleteFile: (fileId: string, ...ctx: Ctx) => Promise<void>;
  /**
   * Retrieves file metadata from storage by ID, resolving `null` if the
   * file is not in storage.
   */
  getFile: (fileId: string, ...ctx: Ctx) => Promise<MetadataFile | null>;
}

export interface FileManagerOptions<Ctx extends any[]> {
  s3BucketName: string;
  metadataStorage: MetadataStorage<Ctx>;
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

export class FileManager<Ctx extends any[] = []> {
  private storage: MetadataStorage<Ctx>;
  private s3: S3;

  constructor(options: FileManagerOptions<Ctx>) {
    this.s3 = options.s3 || new S3(options.s3BucketName);
    this.storage = options.metadataStorage;
  }

  configure = () => {
    return this.s3.configureBucket();
  };

  createFile = async (file: FileData, ...ctx: Ctx) => {
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
      baseFile.imageData = {
        dominantColor,
        thumbnailUrl: thumbnailUpload.Location,
      };
    }

    const baseFileId = await this.storage.createFile(baseFile, ...ctx);

    return {
      id: baseFileId,
      ...baseFile,
    };
  };

  deleteFile = async (fileId: string, ...ctx: Ctx) => {
    const file = await this.storage.getFile(fileId, ...ctx);
    if (!file) {
      throw new HttpError('The file does not exist', 404);
    }
    if (file.imageData) {
      await this.s3.deleteFile(file.imageData.thumbnailUrl);
    }
    await this.s3.deleteFile(file.url);
    await this.storage.deleteFile(fileId, ...ctx);
  };
}
