const cors = require("cors")
const express = require('express')

class NoodleMiddleware {
  constructor(expressInstance) {
    this.express = expressInstance
    this.express.use(cors())
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(shared.api.middleware.getIp)
    this.express.use((req, res, next) => {
      log.request.info(req.path, req.ip, req.body)
      next()
    })

    this.express.use((req, res, next) => {
      req.body = lib.util.camelToSnakeCase(req.body)
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
