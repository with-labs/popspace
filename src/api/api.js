const MercuryMiddleware = require("./mercury_middleware")
const http = require("./http")

class Api {
  constructor(express) {
    this.express = express
    this.loggedInPostMiddleware = new MercuryMiddleware(express)
    this.loggedInPostMiddleware.initLoggedInPost()
  }

  loggedInPostEndpoint(endpoint, handler) {
    this.express.post(endpoint, async (req, res) => {
      await this.loggedInPostMiddleware.run(req, res)
      if(!req.user) {
        return http.fail(req, res, "Must be logged in", {error_code: shared.error.code.UNAUTHORIZED_USER})
      }
      handler(req, res)
    })
  }

  loggedOutPostEndpoint(endpoint, handler) {
    this.express.post(endpoint, (req, res) => {
      handler(req, res)
    })
  }

  loggedOutGetEndpoint(endpoint, handler) {
    this.express.get(endpoint, handler)
  }
}

module.exports = Api
