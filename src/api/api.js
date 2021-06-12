const HermesMiddleware = require("./hermes_middleware")
const http = require("./http")

const safeHandleRequest = (endpoint, handler) => {
  return async (req, res) => {
    log.http.info(`${endpoint} - ${JSON.stringify(req.body)}`)
    try {
      return handler(req, res)
    } catch (e) {
      log.error.error(`Unexpected API error ${req.originalUrl}: ${JSON.stringify(req.body)}`)
      return http.fail(req, res, "Unexpected error", {
        errorCode: shared.error.code.UNEXPECTED_ERROR,
        params: req.body
      })
    }
  }
}

class Api {
  constructor(express) {
    this.express = express
    this.middleware = new HermesMiddleware(express)
  }

  setupGenericErrorHandling() {
    this.express.use((err, req, res, next) => {
      http.fail(req, res, err.message, {errorCode: err.errorCode}, err.httpCode)
    })
  }

  memberOrCreatorRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      this.middleware.requireRoomMemberOrCreator()
    ]
    return this.roomRouteEndpoint(endpoint, handler, middlewareList)
  }

  memberRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      this.middleware.requireRoomMember()
    ]
    return this.roomRouteEndpoint(endpoint, handler, middlewareList)
  }

  creatorOnlyRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      this.middleware.requireRoomCreator()
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
      this.middleware.getActor(),
      this.middleware.requireActor(),
      ...additionalMiddleware
    ]
    this.express.post(endpoint, middlewareList, safeHandleRequest(endpoint, handler))
  }

  loggedInGetEndpoint(endpoint, handler, additionalMiddleware=[]) {
    const middlewareList = [
      this.middleware.getActor(),
      this.middleware.requireActor(),
      ...additionalMiddleware
    ]
    this.express.get(endpoint, this.middleware, safeHandleRequest(endpoint, handler))
  }

  loggedOutPostEndpoint(endpoint, handler,) {
    this.express.post(endpoint, safeHandleRequest(endpoint, handler))
  }

  loggedOutGetEndpoint(endpoint, handler) {
    this.express.get(endpoint, safeHandleRequest(endpoint, handler))
  }
}

module.exports = Api
