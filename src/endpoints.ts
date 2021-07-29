import { Handler } from 'express';

import { FileManager } from './FileManager';
import { HttpError } from './HttpError';

export const createFileHandler =
  (manager: FileManager): Handler =>
  async (req, res) => {
    if (!req.file) {
      throw new HttpError('A single file is required', 400);
    }

    const file = await manager.createFile(req.file);
    res.send(file);
  };

export const deleteFileHandler =
  (
    manager: FileManager,
    { idParamName = 'id' }: { idParamName?: string } = {},
  ): Handler =>
  async (req, res) => {
    const id = req.params[idParamName];
    try {
      await manager.deleteFile(id);
      res.send({ success: true });
    } catch (err) {
      throw new HttpError('File ID must be provided', 400);
    }
  };
