import auth from './auth';

const COOKIE_NAME = 'ndl_session';

/*
  Browsers don't send the Authorization header for <img> tags, download
  links or websocket handshakes, so the API mirrors the session token into
  an HttpOnly cookie. It is only read by the file server and the document
  server; API endpoints keep using the bearer token.
*/
export class SessionCookie {
  name = COOKIE_NAME;

  read(cookieHeader?: string | string[]) {
    const header = Array.isArray(cookieHeader)
      ? cookieHeader.join(';')
      : cookieHeader;
    if (!header) {
      return null;
    }
    for (const part of header.split(';')) {
      const separator = part.indexOf('=');
      if (separator < 0) continue;
      if (part.slice(0, separator).trim() === COOKIE_NAME) {
        try {
          return decodeURIComponent(part.slice(separator + 1).trim());
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  async actorFromRequest(req: { headers: Record<string, any> }) {
    const token = this.read(req.headers.cookie);
    if (!token) {
      return null;
    }
    const { actor } = await auth.actorAndSessionFromToken(token);
    return actor || null;
  }
}

export default new SessionCookie();
