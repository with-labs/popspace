import express from 'express';
import {
  extendExpress,
  FileManager,
  MetadataFile,
  MetadataImageData,
  MetadataStorage,
  S3,
  WithFile,
  WithImageData,
} from '../src';
import dotenv from 'dotenv';
import exitHook from 'async-exit-hook';
import { v4 } from 'uuid';

dotenv.config();

const app = express();

// this server uses a dummy metadata storage system
class DummyMetadata implements MetadataStorage {
  files: Record<string, MetadataFile> = {};
  imageData: Record<string, MetadataImageData> = {};

  createFile = async (file: WithFile) => {
    const id = v4();
    this.files[id] = { ...file, id };
    return id;
  };

  createImageData = async (imageData: WithImageData) => {
    this.imageData[imageData.fileId] = { ...imageData };
    return imageData.fileId;
  };

  getFile = async (id: string) => {
    return this.files[id];
  };

  getImageData = async (id: string) => {
    return this.imageData[id];
  };

  deleteFile = async (id: string) => {
    delete this.files[id];
  };

  deleteImageData = async (id: string) => {
    delete this.imageData[id];
  };
}

const metadata = new DummyMetadata();

const manager = new FileManager({
  metadataStorage: metadata,
  s3BucketName: 'with-files-test',
  s3: new S3('with-files-test', true),
});

manager.configure().then(() => {
  console.log('Successfully configured bucket');
});

extendExpress(app, manager);

app.listen(4000, () => {
  // @tslint-ignore
  console.info('Listening on http://localhost:4000');
});

exitHook(async (cb) => {
  let cleaned = 0;
  for (const id of Object.keys(metadata.files)) {
    await manager.deleteFile(id);
    cleaned++;
  }
  console.info(`Cleaned ${cleaned} files`);
  cb();
});
