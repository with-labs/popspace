import { ErrorCodes } from '../constants/ErrorCodes';

// data types from the backend
export type RoomInfo = {
  room_id: string;
  owner_id: string;
  preview_image_url: string;
  display_name: string;
  route: string;
};

export type UserInfo = {
  avatar_url: string | null;
  created_at: string;
  display_name: string;
  email: string;
  first_name: string;
  last_name: string;
  id: string;
  newsletter_opt_in: boolean;
};

// TODO: update error object once we bring that into line
export type ErrorInfo = {
  errorCode: ErrorCodes;
  error?: { [key: string]: any };
};
