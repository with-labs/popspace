export {
  FileManager,
  MetadataFile,
  FileManagerOptions,
  MetadataStorage,
  UploadedFile as WithFile,
  FileImageData as WithImageData,
} from './FileManager';
export { S3Storage } from './S3';
export { DiskStorage } from './DiskStorage';
export type { Storage } from './Storage';

// declare global {
//   const jest: {
//     fn: (...args: any[]) => any;
//     mock: any;
//   };
//   const describe: any;
//   const it: any;
//   const beforeEach: any;
//   const expect: any;
// }
