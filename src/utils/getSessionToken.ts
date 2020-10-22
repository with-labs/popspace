import { sessionTokenExists } from './SessionTokenExists';
import { USER_SESSION_TOKEN } from '../constants/User';

export function getSessionToken() {
  const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);

  if (sessionTokenExists(sessionToken)) {
    return sessionToken;
  }
  return null;
}
