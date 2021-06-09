/*
  This is a helper file with a 'zoo' of endpoints types.
  Each type is defined by its list of middleware
  (which also implies certain required parameters).
*/

const http = require("./http")

const safeHandleRequest = (endpoint, handler) => {
  return async (req, res) => {
    log.http.info(`Handling ${endpoint} - ${JSON.stringify(req.body)}`)
    try {
      return handler(req, res)
    } catch (e) {
      log.error.error(`Unexpected API error ${req.originalUrl}: ${JSON.stringify(req.body)}`)
      e.message = e.message || "Unexpected error"
      e.errorCode = e.errorCode || shared.error.code.UNEXPECTED_ERROR
      e.params = req.body
      return http.fail(req, res, e)
    }
  }
}

class Api {
  constructor(express) {
    this.express = express
  }

  setupGenericErrorHandling() {
    this.express.use((err, req, res, next) => {
      http.fail(req, res, err, err.httpCode)
    })
  }

  memberOrOwnerRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      shared.api.middleware.requireRoomMemberOrOwner
    ]
    return this.roomRouteEndpoint(endpoint, handler, middlewareList)
  }

  memberRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      shared.api.middleware.requireRoomMember
    ]
    return this.roomRouteEndpoint(endpoint, handler, middlewareList)
  }

  ownerOnlyRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      shared.api.middleware.requireRoomOwner
    ]
    return this.roomRouteEndpoint(endpoint, handler, middlewareList)
  }

  roomRouteEndpoint(endpoint, handler, additionalMiddleware=[]) {
    const middlewareList = [
      shared.api.middleware.roomFromRoute,
      shared.api.middleware.requireRoom,
      ...additionalMiddleware
    ]
    return this.loggedInPostEndpoint(endpoint, handler, middlewareList)
  }

  loggedInPostEndpoint(endpoint, handler, additionalMiddleware=[]) {
    const middlewareList = [
      shared.api.middleware.getUser,
      shared.api.middleware.requireUser,
      ...additionalMiddleware
    ]
    this.express.post(endpoint, middlewareList, safeHandleRequest(endpoint, handler))
  }

  loggedInGetEndpoint(endpoint, handler, additionalMiddleware=[]) {
    const middlewareList = [
      shared.api.middleware.getUser,
      shared.api.middleware.requireUser,
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
