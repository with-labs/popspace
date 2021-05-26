import { ErrorCodes } from '@constants/ErrorCodes';

export class FatalError extends Error {
  constructor(message: string, public errorCode: ErrorCodes) {
    super(message);
  }
}
