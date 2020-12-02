import { ErrorCodes } from '../constants/ErrorCodes';
import i18next, { TFunction } from 'i18next';
import { BaseResponse } from './api';

export function getErrorDialogText(errorCode: ErrorCodes | null, t: TFunction) {
  let retMessage = null;
  if (errorCode && i18next.exists(`error.modal.${errorCode}`)) {
    retMessage = {
      title: i18next.exists(`error.modal.${errorCode}.title`) ? t(`error.modal.${errorCode}.title`) : '',
      body: i18next.exists(`error.modal.${errorCode}.body`) ? t(`error.modal.${errorCode}.body`) : '',
    };
  }
  return retMessage;
}

export function getErrorMessageFromResponse(error: BaseResponse | null, t: TFunction) {
  let retMessage = null;

  if (error) {
    retMessage = i18next.exists(`error.api.${error.errorCode}.message`)
      ? t(`error.api.${error.errorCode}.message`)
      : error.message;
  }

  return retMessage;
}
