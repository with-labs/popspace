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

dotenv.config();

const app = express();

// this server uses a dummy metadata storage system
class DummyMetadata implements MetadataStorage {
  files: (MetadataFile | null)[] = [];
  imageData: (MetadataImageData | null)[] = [];

  createFile = async (file: WithFile) => {
    const id = this.files.length;
    this.files.push({ ...file, id });
    return id;
  };

  createImageData = async (imageData: WithImageData) => {
    const id = this.imageData.length;
    this.imageData.push({ ...imageData, id });
    return id;
  };

  getFile = async (id: number) => {
    return this.files[id];
  };

  getImageData = async (id: number) => {
    return this.imageData[id];
  };

  deleteFile = async (id: number) => {
    this.files[id] = null;
  };

  deleteImageData = async (id: number) => {
    this.imageData[id] = null;
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
  for (const file of metadata.files) {
    if (file) {
      await manager.deleteFile(file.id);
      cleaned++;
    }
  }
  console.info(`Cleaned ${cleaned} files`);
  cb();
});
