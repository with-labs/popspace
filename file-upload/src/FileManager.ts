import { extname } from 'path';
import { v4 as uuid } from 'uuid';

import { HttpError } from './HttpError';
import { extractDominantColor, generateThumbnail } from './imageProcessing';
import { S3Storage } from './S3';
import { Storage } from './Storage';

/**
 * Data for a file upload
 */
export interface UploadedFile {
  name: string;
  mimetype: string;
  url: string;
  imageData?: FileImageData;
  sizeInBytes: number;
}

/**
 * Additional data processed for image file uploads
 */
export interface FileImageData {
  thumbnailUrl: string;
  dominantColor: string;
}

export interface MetadataFile extends UploadedFile {
  id: string;
}

export interface MetadataStorage<Ctx extends any[] = []> {
  /**
   * Writes file metadata to storage, returning a copy of the metadata with an ID.
   */
  createFileMetadata: (
    file: UploadedFile,
    ...ctx: Ctx
  ) => Promise<MetadataFile>;
  /**
   * Deletes file metadata from storage by ID.
   */
  deleteFileMetadata: (fileId: string, ...ctx: Ctx) => Promise<void>;
  /**
   * Retrieves file metadata from storage by ID, resolving `null` if the
   * file is not in storage.
   */
  getFileMetadata: (
    fileId: string,
    ...ctx: Ctx
  ) => Promise<MetadataFile | null>;
}

export interface FileManagerOptions<Ctx extends any[]> {
  metadataStorage: MetadataStorage<Ctx>;
  /** Provide an alternate origin for the URLs created for files. Use this for CloudFront.
   * Defaults to `null` which means the URLs will be created using the origin of the bucket.
   * Do not include a trailing slash.
   * @example `'https://abcdef123456.cloudfront.net'`
   */
  hostOrigin?: string | null;
  /** Provide a storage implementation */
  storage: Storage;
}

export interface FileData {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  /** In bytes */
  size: number;
}

export class FileManager<Ctx extends any[] = []> {
  private metadata: MetadataStorage<Ctx>;
  private storage: Storage;
  private hostOrigin: string | null;

  constructor(options: FileManagerOptions<Ctx>) {
    this.storage = options.storage;
    this.metadata = options.metadataStorage;
    this.hostOrigin = options.hostOrigin || null;
  }

  initialize = () => {
    return this.storage.initialize();
  };

  create = async (file: FileData, ...ctx: Ctx) => {
    const prefix = uuid();
    const baseFileKey = `${prefix}/${file.originalname}`;

    // upload base file to s3
    const baseUpload = await this.storage.storeFileBuffer(
      baseFileKey,
      file.buffer,
      file.mimetype,
    );

    const uploadUrl = this.hostOrigin
      ? new URL(`${this.hostOrigin}/${baseFileKey}`).href
      : baseUpload;

    const baseFile: UploadedFile = {
      name: file.originalname,
      mimetype: file.mimetype,
      url: uploadUrl,
      sizeInBytes: file.size,
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
      const thumbnailUpload = await this.storage.storeFileBuffer(
        thumbnailKey,
        thumbnail,
        file.mimetype,
      );
      const thumbnailUrl = this.hostOrigin
        ? new URL(`${this.hostOrigin}/${thumbnailKey}`).href
        : thumbnailUpload;
      baseFile.imageData = {
        dominantColor,
        thumbnailUrl,
      };
    }

    return this.metadata.createFileMetadata(baseFile, ...ctx);
  };

  delete = async (fileId: string, ...ctx: Ctx) => {
    const file = await this.metadata.getFileMetadata(fileId, ...ctx);
    if (!file) {
      throw new HttpError('The file does not exist', 404);
    }
    if (file.imageData) {
      await this.storage.deleteFile(file.imageData.thumbnailUrl);
    }
    await this.storage.deleteFile(file.url);
    await this.metadata.deleteFileMetadata(fileId, ...ctx);
  };
}
