# with-files

File upload, processing, and management subsystem for With.

## Features

1. Automatically creates and configures a specified S3 bucket
2. Uploads files to S3 with correct mimetype
3. Autogenerates thumbnails for images
4. Extracts dominant color from images
5. Synchronizes file metadata to external metadata storage (you provide that interface)

## Metadata Storage

To store information about the files uploaded to S3 so you can clean them up later, you should provide an interface
implementation of `MetadataStorage` which reads and writes the appropriate data from a persistent storage.

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
