const MercuryMiddleware = require("./mercury_middleware")
const http = require("./http")


const safeHandleRequest = (handler) => {
  return async (req, res) => {
    try {
      return handler(req, res)
    } catch (e) {
      log.error.error(`Unexpected API error ${req.originalUrl}: ${JSON.stringify(req.body)}`)
      return http.fail(req, res, "Unexpected error", {
        errorCode: lib.ErrorCodes.UNEXPECTED_ERROR,
        params: req.body
      })
    }
  }
}

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

  memberRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      this.middleware.requireRoomMember()
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
    this.express.post(endpoint, middlewareList, safeHandleRequest(handler))
  }

  loggedInGetEndpoint(endpoint, handler, additionalMiddleware=[]) {
    const middlewareList = [
      this.middleware.getUser(),
      this.middleware.requireUser(),
      ...additionalMiddleware
    ]
    this.express.get(endpoint, this.middleware, safeHandleRequest(handler))
  }

  loggedOutPostEndpoint(endpoint, handler,) {
    this.express.post(endpoint, safeHandleRequest(handler))
  }

  loggedOutGetEndpoint(endpoint, handler) {
    this.express.get(endpoint, safeHandleRequest(handler))
  }
}

module.exports = Api
