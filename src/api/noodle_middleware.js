const bodyParser = require("body-parser")
const cors = require("cors")

class NoodleMiddleware {
  constructor(express) {
    this.express = express
    this.express.use(cors())
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
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
    this.express.use(shared.api.middleware.getIp)
  }
}

module.exports = Noodle
