const cors = require("cors")
const express = require('express')

// extra origins allowed to send cookies, e.g. when the UI is on another domain
const TRUSTED_ORIGINS = (process.env.TRUSTED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean)

const isTrustedOrigin = (origin, req) => {
  if (!origin) {
    return false
  }
  if (TRUSTED_ORIGINS.includes(origin)) {
    return true
  }
  try {
    // the UI is served from the same host as the API, on another port
    return new URL(origin).hostname === req.hostname
  } catch (e) {
    return false
  }
}

/*
  Credentialed requests (which carry the session cookie) are only allowed
  from the app itself. Everyone else keeps the old open CORS policy, which
  browsers refuse to combine with cookies.
*/
const corsOptions = (req, callback) => {
  const origin = req.header("Origin")
  if (isTrustedOrigin(origin, req)) {
    return callback(null, { origin, credentials: true })
  }
  callback(null, { origin: "*" })
}

class NoodleMiddleware {
  constructor(expressInstance) {
    this.express = expressInstance
    this.express.use(cors(corsOptions))

    this.express.use(async (req, res, next) => {
      await next()
      // stringifies bigints
      req.body = shared.db.serialization.serialize(req.body)
    })

    this.express.use(express.json({
      // parses stringified bigints
      reviver: shared.db.serialization.reviver
    }));
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(shared.api.middleware.getIp)
    this.express.use((req, res, next) => {
      log.request.info(req.path, req.realIp, lib.util.redact(req.body))
      next()
    })

    this.express.use((req, res, next) => {
      req.noodle = {
        webUrl: lib.appInfo.webUrl(req),
        apiUrl: lib.appInfo.apiUrl(req),
      }
      next()
    })
  }
}

module.exports = NoodleMiddleware
