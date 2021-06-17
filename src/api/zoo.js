/*
  This is a helper file with a 'zoo' of endpoints types.
  Each type is defined by its list of middleware
  (which also implies certain required parameters).
*/

const http = require("./http")

const safeHandleRequest = (endpoint, handler) => {
  return async (req, res) => {
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

class Zoo {
  constructor(express) {
    this.express = express
  }

  setupGenericErrorHandling() {
    this.express.use((err, req, res, next) => {
      http.fail(req, res, err, err.httpCode)
    })
  }

  memberOrCreatorRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      shared.api.middleware.requireRoomMemberOrCreator
    ]
    return this.roomRouteEndpoint(endpoint, handler, middlewareList)
  }

  memberRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      shared.api.middleware.requireRoomMember
    ]
    return this.roomRouteEndpoint(endpoint, handler, middlewareList)
  }

  creatorOnlyRoomRouteEndpoint(endpoint, handler) {
    const middlewareList = [
      shared.api.middleware.requireRoomCreator
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
    console.log(`Initializing logged in POST: ${endpoint}`)
    log.app.info(`Initializing logged in POST: ${endpoint}`)
    const middlewareList = [
      shared.api.middleware.getActor,
      shared.api.middleware.requireActor,
      ...additionalMiddleware
    ]

    this.express.post(endpoint, middlewareList, safeHandleRequest(endpoint, handler))
  }

  loggedInGetEndpoint(endpoint, handler, additionalMiddleware=[]) {
    log.app.info(`Initializing logged in GET: ${endpoint}`)
    const middlewareList = [
      shared.api.middleware.getActor,
      shared.api.middleware.requireActor,
      ...additionalMiddleware
    ]
    this.express.get(endpoint, middlewareList, safeHandleRequest(endpoint, handler))
  }

  loggedOutPostEndpoint(endpoint, handler,) {
    log.app.info(`Initializing logged out POST: ${endpoint}`)
    this.express.post(endpoint, [], safeHandleRequest(endpoint, handler))
  }

  loggedOutGetEndpoint(endpoint, handler) {
    log.app.info(`Initializing logged out GET: ${endpoint}`)
    this.express.get(endpoint, [], safeHandleRequest(endpoint, handler))
  }
}

module.exports = Zoo
