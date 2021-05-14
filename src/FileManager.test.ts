import { FileManager } from './FileManager';

jest.mock('./imageProcessing');
jest.mock('uuid');

const mockS3 = {
  uploadFileBuffer: jest.fn((key: string) =>
    Promise.resolve({
      Location: `https://mock-s3.com/${key}`,
    }),
  ),
  deleteFile: jest.fn().mockResolvedValue({}),
};

const mockMetadata = {
  createFile: jest.fn().mockResolvedValue('mock-file-id'),
  createImageData: jest.fn().mockResolvedValue('mock-image-data-id'),
  deleteFile: jest.fn().mockResolvedValue(undefined),
  deleteImageData: jest.fn().mockResolvedValue(undefined),
  getFile: jest.fn().mockResolvedValue({
    id: 'mock-file-id',
    url: 'https://mock-s3.com/mock-uuid/file.png',
    mimetype: 'image/png',
    name: 'file.png',
  }),
  getImageData: jest.fn().mockResolvedValue({
    fileId: 'mock-file-id',
    thumbnailUrl: 'https://mock-s3.com/mock-uuid/file.thumb.png',
    dominantColor: 'rgba(0, 0, 0)',
  }),
};

const mockFile = Buffer.from('mock file!', 'utf-8');

describe('FileManager', () => {
  let manager: FileManager;

  beforeEach(() => {
    manager = new FileManager({
      metadataStorage: mockMetadata,
      s3: mockS3 as any,
      s3BucketName: 'mock-bucket',
    });
  });

  it('should create a plain file', async () => {
    const result = await manager.createFile({
      originalname: 'file.txt',
      buffer: mockFile,
      mimetype: 'text/plain',
    });

    expect(mockS3.uploadFileBuffer).toHaveBeenCalledTimes(1);
    expect(mockMetadata.createFile).toHaveBeenCalledTimes(1);

    expect(mockS3.uploadFileBuffer).toHaveBeenCalledWith(
      'mock-uuid/file.txt',
      mockFile,
      'text/plain',
    );
    expect(mockMetadata.createFile).toHaveBeenCalledWith({
      name: 'file.txt',
      mimetype: 'text/plain',
      url: 'https://mock-s3.com/mock-uuid/file.txt',
    });

    expect(result.imageData).toBe(undefined);
    expect(result.id).toBe('mock-file-id');
    expect(result.mimetype).toBe('text/plain');
    expect(result.url).toBe('https://mock-s3.com/mock-uuid/file.txt');
  });

  it('should create and process an image file', async () => {
    const result = await manager.createFile({
      originalname: 'file.png',
      buffer: mockFile,
      mimetype: 'image/png',
    });

    expect(mockS3.uploadFileBuffer).toHaveBeenCalledTimes(2);
    expect(mockMetadata.createFile).toHaveBeenCalledTimes(1);
    expect(mockMetadata.createImageData).toHaveBeenCalledTimes(1);

    expect(mockS3.uploadFileBuffer).toHaveBeenCalledWith(
      'mock-uuid/file.png',
      mockFile,
      'image/png',
    );
    expect(mockS3.uploadFileBuffer).toHaveBeenCalledWith(
      'mock-uuid/file.thumb.png',
      // due to mocking of thumbnail generation, the same buffer is used
      mockFile,
      'image/png',
    );
    expect(mockMetadata.createFile).toHaveBeenCalledWith({
      name: 'file.png',
      mimetype: 'image/png',
      url: 'https://mock-s3.com/mock-uuid/file.png',
    });
    expect(mockMetadata.createImageData).toHaveBeenCalledWith({
      fileId: 'mock-file-id',
      thumbnailUrl: 'https://mock-s3.com/mock-uuid/file.thumb.png',
      dominantColor: 'rgb(0, 0, 0)',
    });

    expect(result.id).toBe('mock-file-id');
    expect(result.mimetype).toBe('image/png');
    expect(result.url).toBe('https://mock-s3.com/mock-uuid/file.png');
    expect(result.imageData).toEqual({
      fileId: 'mock-file-id',
      thumbnailUrl: 'https://mock-s3.com/mock-uuid/file.thumb.png',
      dominantColor: 'rgb(0, 0, 0)',
    });
  });

  it('should delete a file and its metadata', async () => {
    // mock that there's no image data for this file
    mockMetadata.getImageData.mockResolvedValue(null);

    await manager.deleteFile('mock-file-id');

    expect(mockMetadata.getFile).toHaveBeenCalledTimes(1);
    expect(mockMetadata.getFile).toHaveBeenCalledWith('mock-file-id');

    expect(mockS3.deleteFile).toHaveBeenCalledTimes(1);
    expect(mockS3.deleteFile).toHaveBeenCalledWith(
      'https://mock-s3.com/mock-uuid/file.png',
    );

    expect(mockMetadata.getImageData).toHaveBeenCalledTimes(1);
    expect(mockMetadata.getImageData).toHaveBeenCalledWith('mock-file-id');

    expect(mockMetadata.deleteFile).toHaveBeenCalledTimes(1);
    expect(mockMetadata.deleteFile).toHaveBeenCalledWith('mock-file-id');
  });

  it('should delete an image file, thumbnail, and all of its metadata', async () => {
    mockMetadata.getImageData.mockResolvedValue({
      id: 'mock-image-data-id',
      fileId: 'mock-file-id',
      thumbnailUrl: 'https://mock-s3.com/mock-uuid/file.thumb.png',
      dominantColor: 'rgba(0, 0, 0)',
    });

    await manager.deleteFile('mock-file-id');

    expect(mockMetadata.getFile).toHaveBeenCalledTimes(1);
    expect(mockMetadata.getFile).toHaveBeenCalledWith('mock-file-id');

    expect(mockS3.deleteFile).toHaveBeenCalledTimes(2);
    expect(mockS3.deleteFile).toHaveBeenCalledWith(
      'https://mock-s3.com/mock-uuid/file.png',
    );
    expect(mockS3.deleteFile).toHaveBeenCalledWith(
      'https://mock-s3.com/mock-uuid/file.thumb.png',
    );

    expect(mockMetadata.getImageData).toHaveBeenCalledTimes(1);
    expect(mockMetadata.getImageData).toHaveBeenCalledWith('mock-file-id');

    expect(mockMetadata.deleteFile).toHaveBeenCalledTimes(1);
    expect(mockMetadata.deleteFile).toHaveBeenCalledWith('mock-file-id');

    expect(mockMetadata.deleteImageData).toHaveBeenCalledTimes(1);
    expect(mockMetadata.deleteImageData).toHaveBeenCalledWith('mock-file-id');
  });
});
