/*
  Mirrors the bearer session token into an HttpOnly cookie so the browser
  can load room files (<img>, download links) and open the document
  websocket. See noodle-shared/src/lib/session_cookie.ts.
*/
const MAX_AGE_MILLIS = 30 * 24 * 60 * 60 * 1000

const isHttps = (req) => req.secure || req.headers['x-forwarded-proto'] === 'https'

const sessionCookie = {
  refresh: (req, res, next) => {
    const token = req.session && req.session.secret
    if (token && shared.lib.sessionCookie.read(req.headers.cookie) !== token) {
      res.cookie(shared.lib.sessionCookie.name, token, {
        httpOnly: true,
        // the app, API and document server share a host on different
        // ports, which counts as same-site
        sameSite: 'lax',
        secure: isHttps(req),
        maxAge: MAX_AGE_MILLIS,
        path: '/'
      })
    }
    next()
  }
}

module.exports = sessionCookie
