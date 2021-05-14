import { Application, ErrorRequestHandler, Handler } from 'express';
import multer from 'multer';
import { FileManager } from './FileManager';
import { HttpError } from './HttpError';

// basic in-memory multipart upload handler middleware
const uploadHandler = multer();

// error handler middleware
const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.code).send({ message: err.message });
  } else {
    console.error(err);
    res.status(500).send({ message: 'Unexpected error' });
  }
};

export interface ExtendOptions {
  /** A path prefix, excluding leading or trailing slash. */
  pathPrefix?: string;
}

export const extendExpress = (
  app: Application,
  manager: FileManager,
  options?: ExtendOptions,
) => {
  const makePath = (path: string) =>
    `${options?.pathPrefix ? `/${options.pathPrefix}` : ''}${path}`;

  const createFile: Handler = async (req, res) => {
    if (!req.file) {
      throw new HttpError('A file is required', 400);
    }

    const file = await manager.createFile(req.file);
    res.send(file);
  };

  const deleteFile: Handler = async (req, res) => {
    const id = req.params.id;
    try {
      const idInt = parseInt(id, 10);
      await manager.deleteFile(idInt);
      res.send({ success: true });
    } catch (err) {
      throw new HttpError('File ID must be an integer', 400);
    }
  };

  app.post(
    makePath('/files'),
    uploadHandler.single('file'),
    errorMiddleware,
    createFile,
  );

  app.delete(makePath('/files/:id'), errorMiddleware, deleteFile);
};
