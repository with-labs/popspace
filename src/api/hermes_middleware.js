const http = require("./http")
const bodyParser = require("body-parser")
const cors = require("cors")

class HermesMiddleware {
  constructor(express) {
    this.express = express
    this.express.use(cors())
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
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
      req.mercury = {
        webUrl: lib.appInfo.webUrl(req),
        apiUrl: lib.appInfo.apiUrl(req),
      }
      next()
    })
  }


}

module.exports = HermesMiddleware
