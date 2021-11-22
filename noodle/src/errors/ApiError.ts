import { ErrorResponse } from '@api/types';
import { ErrorCodes } from '@constants/ErrorCodes';
import { ErrorTypes } from '@constants/ErrorTypes';

export class ApiError extends Error {
  private _code: ErrorCodes;
  private _type: ErrorTypes;
  private _httpCode: number;

  get errorCode() {
    return this._code;
  }

  get type() {
    return this._type;
  }

  get httpCode() {
    return this._httpCode;
  }

  constructor(response: ErrorResponse, httpCode = 500) {
    super(response.message || 'Unexpected error');
    this._code = (response.errorCode?.toString() as ErrorCodes) || ErrorCodes.UNEXPECTED;
    this._type = ErrorTypes.API;
    this._httpCode = httpCode || 500;
  }
}
