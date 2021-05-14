import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { S3 } from './S3';
import { extractDominantColor, generateThumbnail } from './imageProcessing';
import { HttpError } from './HttpError';

/**
 * Data for a file upload
 */
export interface WithFile {
  name: string;
  mimetype: string;
  url: string;
}

/**
 * Additional data processed for image file uploads
 */
export interface WithImageData {
  fileId: string;
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
   * Writes image metadata to storage, returning an ID.
   */
  createImageData: (imageData: WithImageData, ...ctx: Ctx) => Promise<string>;
  /**
   * Deletes file metadata from storage by ID.
   */
  deleteFile: (fileId: string, ...ctx: Ctx) => Promise<void>;
  /**
   * Deletes image metadata from storage by it's associated file ID.
   */
  deleteImageData: (fileId: string, ...ctx: Ctx) => Promise<void>;
  /**
   * Retrieves file metadata from storage by ID, resolving `null` if the
   * file is not in storage.
   */
  getFile: (fileId: string, ...ctx: Ctx) => Promise<MetadataFile | null>;
  /**
   * Retrieves image data from storage by its associated file ID, resolving
   * `null` if there is no image metadata associated with the file ID.
   */
  getImageData: (
    fileId: string,
    ...ctx: Ctx
  ) => Promise<MetadataImageData | null>;
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

    const baseFileId = await this.storage.createFile(baseFile, ...ctx);

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
      await this.storage.createImageData(imageData, ...ctx);
      result.imageData = imageData;
    }

    return result;
  };

  deleteFile = async (fileId: string, ...ctx: Ctx) => {
    const file = await this.storage.getFile(fileId, ...ctx);
    if (!file) {
      throw new HttpError('The file does not exist', 404);
    }
    const imageData = await this.storage.getImageData(fileId, ...ctx);
    if (imageData) {
      await this.s3.deleteFile(imageData.thumbnailUrl);
      await this.storage.deleteImageData(fileId, ...ctx);
    }
    await this.s3.deleteFile(file.url);
    await this.storage.deleteFile(fileId, ...ctx);
  };
}
