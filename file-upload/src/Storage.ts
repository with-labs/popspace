import { MetadataFile } from './FileManager';

export interface Storage {
  storeFileBuffer(key: string, data: Buffer, mimetype: string): Promise<string>;
  deleteFile(file: MetadataFile): Promise<any>;
  initialize(): Promise<any>;
}
