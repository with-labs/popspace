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
  createFileMetadata: jest.fn((input) => ({ ...input, id: 'mock-file-id' })),
  deleteFileMetadata: jest.fn().mockResolvedValue(undefined),
  getFileMetadata: jest.fn().mockResolvedValue({
    id: 'mock-file-id',
    url: 'https://mock-s3.com/mock-uuid/file.png',
    mimetype: 'image/png',
    name: 'file.png',
    imageData: undefined,
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
    const result = await manager.create({
      originalname: 'file.txt',
      buffer: mockFile,
      mimetype: 'text/plain',
    });

    expect(mockS3.uploadFileBuffer).toHaveBeenCalledTimes(1);
    expect(mockMetadata.createFileMetadata).toHaveBeenCalledTimes(1);

    expect(mockS3.uploadFileBuffer).toHaveBeenCalledWith(
      'mock-uuid/file.txt',
      mockFile,
      'text/plain',
    );
    expect(mockMetadata.createFileMetadata).toHaveBeenCalledWith({
      name: 'file.txt',
      mimetype: 'text/plain',
      url: 'https://mock-s3.com/mock-uuid/file.txt',
    });

    expect(result.imageData).toBe(undefined);
    expect(result.id).toBe('mock-file-id');
    expect(result.mimetype).toBe('text/plain');
    expect(result.url).toBe('https://mock-s3.com/mock-uuid/file.txt');
  });

  it('should handle a file with a space in the name using custom origin', async () => {
    const manager = new FileManager({
      metadataStorage: mockMetadata,
      s3: mockS3 as any,
      s3BucketName: 'mock-bucket',
      hostOrigin: 'https://custom-origin',
    });
    const result = await manager.create({
      originalname: 'file test.txt',
      buffer: mockFile,
      mimetype: 'text/plain',
    });

    expect(mockS3.uploadFileBuffer).toHaveBeenCalledTimes(1);
    expect(mockMetadata.createFileMetadata).toHaveBeenCalledTimes(1);

    expect(mockS3.uploadFileBuffer).toHaveBeenCalledWith(
      'mock-uuid/file test.txt',
      mockFile,
      'text/plain',
    );
    expect(mockMetadata.createFileMetadata).toHaveBeenCalledWith({
      name: 'file test.txt',
      mimetype: 'text/plain',
      url: 'https://custom-origin/mock-uuid/file%20test.txt',
    });

    expect(result.imageData).toBe(undefined);
    expect(result.id).toBe('mock-file-id');
    expect(result.mimetype).toBe('text/plain');
    expect(result.url).toBe('https://custom-origin/mock-uuid/file%20test.txt');
  });

  it('should create and process an image file', async () => {
    const result = await manager.create({
      originalname: 'file.png',
      buffer: mockFile,
      mimetype: 'image/png',
    });

    expect(mockS3.uploadFileBuffer).toHaveBeenCalledTimes(2);
    expect(mockMetadata.createFileMetadata).toHaveBeenCalledTimes(1);

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
    expect(mockMetadata.createFileMetadata).toHaveBeenCalledWith({
      name: 'file.png',
      mimetype: 'image/png',
      url: 'https://mock-s3.com/mock-uuid/file.png',
      imageData: {
        thumbnailUrl: 'https://mock-s3.com/mock-uuid/file.thumb.png',
        dominantColor: 'rgb(0, 0, 0)',
      },
    });

    expect(result.id).toBe('mock-file-id');
    expect(result.mimetype).toBe('image/png');
    expect(result.url).toBe('https://mock-s3.com/mock-uuid/file.png');
    expect(result.imageData).toEqual({
      thumbnailUrl: 'https://mock-s3.com/mock-uuid/file.thumb.png',
      dominantColor: 'rgb(0, 0, 0)',
    });
  });

  it('should delete a file and its metadata', async () => {
    await manager.delete('mock-file-id');

    expect(mockMetadata.getFileMetadata).toHaveBeenCalledTimes(1);
    expect(mockMetadata.getFileMetadata).toHaveBeenCalledWith('mock-file-id');

    expect(mockS3.deleteFile).toHaveBeenCalledTimes(1);
    expect(mockS3.deleteFile).toHaveBeenCalledWith(
      'https://mock-s3.com/mock-uuid/file.png',
    );

    expect(mockMetadata.deleteFileMetadata).toHaveBeenCalledTimes(1);
    expect(mockMetadata.deleteFileMetadata).toHaveBeenCalledWith(
      'mock-file-id',
    );
  });

  it('should delete an image file, thumbnail, and all of its metadata', async () => {
    mockMetadata.getFileMetadata.mockResolvedValue({
      id: 'mock-file-id',
      mimetype: 'image/png',
      name: 'file.png',
      url: 'https://mock-s3.com/mock-uuid/file.png',
      imageData: {
        thumbnailUrl: 'https://mock-s3.com/mock-uuid/file.thumb.png',
        dominantColor: 'rgba(0, 0, 0)',
      },
    });

    await manager.delete('mock-file-id');

    expect(mockMetadata.getFileMetadata).toHaveBeenCalledTimes(1);
    expect(mockMetadata.getFileMetadata).toHaveBeenCalledWith('mock-file-id');

    expect(mockS3.deleteFile).toHaveBeenCalledTimes(2);
    expect(mockS3.deleteFile).toHaveBeenCalledWith(
      'https://mock-s3.com/mock-uuid/file.png',
    );
    expect(mockS3.deleteFile).toHaveBeenCalledWith(
      'https://mock-s3.com/mock-uuid/file.thumb.png',
    );

    expect(mockMetadata.deleteFileMetadata).toHaveBeenCalledTimes(1);
    expect(mockMetadata.deleteFileMetadata).toHaveBeenCalledWith(
      'mock-file-id',
    );
  });
});
