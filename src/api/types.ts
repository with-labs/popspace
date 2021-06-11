import { ErrorCodes } from '@constants/ErrorCodes';

export type ErrorResponse = {
  success: false;
  errorCode: ErrorCodes;
  message: string;
};

export type BaseResponse = {
  success: true;
};

export type ApiOpenGraphResult = {
  title: string | null;
  iframeUrl: string | null;
  iconUrl: string | null;
};

export type ApiNamedMeeting = {
  room_id: string;
  owner_id: string;
  preview_image_url: string;
  display_name: string;
  route: string;
  url_id: string;
};
