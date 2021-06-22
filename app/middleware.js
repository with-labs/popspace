const bodyParser = require('body-parser');
const path = require('path')
const favicon = require('serve-favicon');
const cors = require("cors")
const base64Decode = (str) => Buffer.from(str, "base64").toString("utf-8")

class Middleware {
  constructor(express) {
    this.express = express
    this.express.use(cors())
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(favicon(path.join(__dirname, '..', 'public', 'favicon.png')));
    this.initSessions()
    this.initErrors()
  }

  initSessions() {
    this.express.use(shared.api.middleware.getUser)
  }

  initErrors() {
    this.express.use(async (err, req, res, next) => {
      log.error.error(err)
      if (res.headersSent) {
        return next(err)
      }
      blib.util.http.fail(req, res, {errorCode: blib.error.code.UNEXPECTED_ERROR}, "Oops! Something went wrong.")
    })
  }

}

module.exports = Middleware
