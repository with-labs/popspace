const cors = require("cors")
const express = require('express')

class NoodleMiddleware {
  constructor(expressInstance) {
    this.express = expressInstance
    this.express.use(cors())

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
      log.request.info(req.path, req.ip, req.body)
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
