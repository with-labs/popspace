import { ErrorCodes } from '@constants/ErrorCodes';

export class JoinError extends Error {
  constructor(message: string, public errorCode: ErrorCodes) {
    super(message);
  }
}
