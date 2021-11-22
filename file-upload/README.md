# with-files

File upload, processing, and management subsystem for With.

## Features

1. Automatically creates and configures a specified S3 bucket
2. Uploads files to S3 with correct mimetype
3. Autogenerates thumbnails for images
4. Extracts dominant color from images
5. Synchronizes file metadata to external metadata storage (you provide that interface)

## FileManager

`FileManager` is the main functionality class. You need to create one to use the library features.

```ts
const manager = new FileManager({
  s3BucketName: 'my-bucket',
  metadataStorage: new MyMetadataStorage(),
});
```

The two config options shown are required. For more information on metadata storage see [Metadata Storage](#metadata-storage).

## Setting up the S3 bucket

The `FileManager` can configure everything for you, just supply a bucket name and call `.initialize()`. It returns a promise which resolves when the setup is complete.

By default buckets are configured with CORS open to everyone, but uploaded objects do not have public access.

To change CORS allowed origins, specify a comma-separated list of origins in the `S3_CORS_ORIGINS` environment var.

To change the bucket object creation to be publicly accessible, you need to pass a custom `S3` class to `FileManager`'s constructor with the public option on:

```ts
const manager = new FileManager({
  ...
  s3: new S3('my-bucket', true),
});
```

It's not recommended that we use a public bucket - we should create a CloudFront instance which points to the bucket instead, and point a custom subdomain to it.

### `fileManager.create(file, ...context)`

Provide a `File` object to upload to S3. If the file is an image, it will be processed and additional metadata is returned. Additional context parameters can be provided and they will be passed to your MetadatStorage create method.

Return values:

**Non-image file**

```js
{
  name: 'original-filename.ext',
  mimetype: 'original/mimetype',
  url: 'https://s3.url/of/file.ext',
  imageData: undefined
}
```

**Image file**

```js
{
  id: 'some-id',
  name: 'original-filename.png',
  mimetype: 'image/whatever',
  url: 'https://s3.url/of/file.png',
  imageData: {
    thumbnailUrl: 'https://s3.url/of/file.thumb.png',
    dominantColor: 'rgb(100, 200, 0)'
  }
}
```

Image data includes a thumbnail image path (always adjacent to the original file) and an extracted dominant image color, expressed as a CSS `rgb()` string.

### `delete(fileId, ...context)`

Provide the `id` value returned from creating a file to delete it, along with all associated metadata. Image file thumbnails will also be deleted. Provide additional context parameters and they will be supplied to your MetadataStorage delete method.

## Metadata Storage

To provide a metadata storage solution, you should implement the interface `MetadataStorage` which reads and writes the appropriate data from a persistent storage.

The required operations are:

```ts
interface MetadataStorage {
  /**
   * Writes file metadata to storage, returning a copy of the metadata with an ID.
   */
  createFileMetadata: (file: UploadedFile) => Promise<MetadataFile>;
  /**
   * Deletes file metadata from storage by ID.
   */
  deleteFileMetadata: (fileId: string) => Promise<void>;
  /**
   * Retrieves file metadata from storage by ID, resolving `null` if the
   * file is not in storage.
   */
  getFileMetadata: (fileId: string) => Promise<MetadataFile | null>;
}
```

Model IDs are treated as strings for flexibility. Using integer IDs requires conversion within the MetadataStorage implementation.

## Passing context data

Depending on how metadata is stored, you may want to add some context to operations when they're applied within your metadata storage. You can do that by passing additional parameters to any of the methods on `FileManager`. These additional parameters will be forwarded to every internal invocation of a `MetadataStorage` method.

For TypeScript, you should provide a generic type to your `MetadataStorage` class definition specifying which kinds of additional params are required. The generic is an array, pass an array with a single type entry for a single parameter.

```ts
class MyMetadata implements MetadataStorage<[{ userId: string }]> {
  createFileMetadata = (file: WithFile, { userId }: { userId: string }) => {
    // use the context to change how you store file metadata or even
    // authorize storage, etc.
  };
}
```
