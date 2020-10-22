import { ErrorTypes } from '../constants/ErrorType';

// data types from the backend
export type RoomInfo = {
  id: string;
  name: string;
  owner_id: string;
  priority_level: number;
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
  errorType: ErrorTypes;
  error?: { [key: string]: any };
};
