import { MetadataFile } from './FileManager';

export interface Storage {
  storeFileBuffer(key: string, data: Buffer, mimetype: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<any>;
  initialize(): Promise<any>;
}
