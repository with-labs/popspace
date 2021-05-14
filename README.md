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

## Using with Express

The library includes a helper to extend an existing Express app with endpoints for file management. Call `extendExpress`, passing in an Express app and an instance of `FileManager`.

```ts
extendExpress(app, manager, {
  pathPrefix: 'userfiles',
});
```

`pathPrefix` is optional and lets you specify a prefix for the HTTP method paths used for managing files. Don't include leading or trailing slashes.

When the app has been extended, two endpoints are made available:

### `POST /{prefix}/files`

Provide a form-encoded payload with a `file` field that contains a File. If the file is an image, it will be processed and additional metadata is returned. Responses:

**Non-image file**

```js
{
  name: 'original-filename.ext',
  mimetype: 'original/mimetype',
  url: 'https://s3.url/of/file.ext'
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

### `DELETE /{prefix}/files/:id`

Provide the `id` value returned from creating a file to delete it, along with all associated metadata. Image file thumbnails will also be deleted. No payload is required for this endpoint.

## Metadata Storage

The library has an out-of-the-box metadata storage layer implementation using `@withso/with-shared`.

```ts
import { WithSharedMetadataStorage } from '@withso/with-files/dist/interop/WithSharedMetadataStorage';

const metadataStorage = new WithSharedMetadataStorage();

const manager = new FileManager({
  metadataStorage,
  s3BucketName: 'user-files',
});
```

To use `WithSharedMetadataStorage`, you must migrate your Postgres database to include the following tables:

```
files:
  id: int, primary key
  name: string
  url: string
  mimetype: string

file_image_data:
  id: int, primary key
  file_id: int
  thumbnail_url: string
  dominant_color: string
```

To use a different metadata storage solution, you should provide an interface implementation of `MetadataStorage` which reads and writes the appropriate data from a persistent storage.

The required operations are:

```ts
interface MetadataStorage {
  /**
   * Writes file metadata to storage, returning an ID.
   */
  createFile: (file: WithFile) => Promise<string>;
  /**
   * Writes image metadata to storage, returning an ID.
   */
  createImageData: (imageData: WithImageData) => Promise<string>;
  /**
   * Deletes file metadata from storage by ID.
   */
  deleteFile: (fileId: string) => Promise<void>;
  /**
   * Deletes image metadata from storage by it's associated file ID.
   */
  deleteImageData: (fileId: string) => Promise<void>;
  /**
   * Retrieves file metadata from storage by ID, resolving `null` if the
   * file is not in storage.
   */
  getFile: (fileId: string) => Promise<MetadataFile | null>;
  /**
   * Retrieves image data from storage by its associated file ID, resolving
   * `null` if there is no image metadata associated with the file ID.
   */
  getImageData: (fileId: string) => Promise<MetadataImageData | null>;
}
```

Model IDs are treated as strings for flexibility. Using integer IDs requires conversion within the MetadataStorage implementation.

## Running the test server

To test the system as an independent Express server, run `yarn dev`. The following prerequisites must first be met:

1. Define the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` environment vars. You can use a `.env` file (copy `.env.template` and fill it out).

The server will create a bucket (if it doesn't exist) called `with-files-test` in your S3 region under the specified account.
