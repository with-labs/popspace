import { USER_SESSION_TOKEN } from '../constants/User';

export function removeSessionToken() {
  localStorage.removeItem(USER_SESSION_TOKEN);
}
