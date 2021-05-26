import { USER_SESSION_TOKEN } from '@constants/User';

export function sessionTokenExists(sessionToken: string | null) {
  return !!sessionToken && sessionToken !== 'undefined' && sessionToken !== 'null';
}

export function getSessionToken() {
  const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);

  if (sessionTokenExists(sessionToken)) {
    return sessionToken;
  }
  return null;
}

export function setSessionToken(sessionToken: string) {
  localStorage.setItem(USER_SESSION_TOKEN, sessionToken);
}

export function removeSessionToken() {
  localStorage.removeItem(USER_SESSION_TOKEN);
}
