import { ErrorCodes } from '../constants/ErrorCodes';
import { ErrorTypes } from '../constants/ErrorTypes';

import { BaseResponse } from '../utils/api';

export class ApiError extends Error {
  private _code: ErrorCodes;
  private _type: ErrorTypes;

  get errorCode() {
    return this._code;
  }

  get type() {
    return this._type;
  }

  constructor(response: BaseResponse) {
    super(response.message || 'Unexpected error');
    this._code = (response.errorCode?.toString() as ErrorCodes) || ErrorCodes.UNEXPECTED;
    this._type = ErrorTypes.API;
  }
}
