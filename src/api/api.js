const MercuryMiddleware = require("./mercury_middleware")
const http = require("./http")

class Api {
  constructor(express) {
    this.express = express
    this.middleware = new MercuryMiddleware(express)
  }

  setupGenericErrorHandling() {
    this.express.use((err, req, res, next) => {
      http.fail(req, res, err.message, {errorCode: err.errorCode}, err.httpCode)
    })
  }

  memberOrOwnerRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      this.middleware.requireRoomMemberOrOwner()
    ]
    return this.roomRouteEndpoint(endpoint, handler, middlewareList)
  }

  ownerOnlyRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      this.middleware.requireRoomOwner()
    ]
    return this.roomRouteEndpoint(endpoint, handler, middlewareList)
  }

  roomRouteEndpoint(endpoint, handler, additionalMiddleware=[]) {
    const middlewareList = [
      this.middleware.roomFromRoute(),
      this.middleware.requireRoom(),
      ...additionalMiddleware
    ]
    return this.loggedInPostEndpoint(endpoint, handler, middlewareList)
  }

  loggedInPostEndpoint(endpoint, handler, additionalMiddleware=[]) {
    const middlewareList = [
      this.middleware.getUser(),
      this.middleware.requireUser(),
      ...additionalMiddleware
    ]
    this.express.post(endpoint, middlewareList, async (req, res) => {
      handler(req, res)
    })
  }

  loggedOutPostEndpoint(endpoint, handler,) {
    this.express.post(endpoint, (req, res) => {
      handler(req, res)
    })
  }

  loggedOutGetEndpoint(endpoint, handler) {
    this.express.get(endpoint, handler)
  }
}

module.exports = Api
