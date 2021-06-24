/*
  This is a helper file with a 'zoo' of endpoints types.
  Each type is defined by its list of middleware
  (which also implies certain required parameters).
*/

const http = require("./http")


const parseUriParams = (receivedParams, expectedParams = []) => {
  const result = {}
  try {
    for(const param of expectedParams) {
      if(receivedParams[param] == null) {
        throw {missing: param, code: shared.error.code.INVALID_API_PARAMS}
      }
      result[param] = decodeURIComponent(receivedParams[param])
    }
  } catch(e) {
    throw {code: shared.error.code.UNEXPECTED_ERROR, message: e.message, stack: e.stack}
  }
  return result
}

const parseBodyParams = (receivedParams, expectedParams = []) => {
  const result = {}
  for(const param of expectedParams) {
    if(receivedParams[param] == null) {
      const error = new Error(`Invalid ${param}`)
      error.missing = param
      error.code = shared.error.code.INVALID_API_PARAMS
      throw error
    }
    result[param] = receivedParams[param]
  }
  return result
}

const safeHandleRequest = (handler) => async (req, res) => {
  try {
    return await handler(req, res)
  } catch (e) {
    log.error.error(`Unexpected API error ${req.originalUrl}: ${JSON.stringify(req.body)}`)
    log.error.error(e)
    e.message = e.message || "Unexpected error"
    e.errorCode = e.errorCode || shared.error.code.UNEXPECTED_ERROR
    e.params = req.body
    return http.fail(req, res, e)
  }
}

const safePostHandler = (endpoint, handler, requiredParams) => {
  return safeHandleRequest(async (req, res) => {
    const params = parseBodyParams(req.body, requiredParams)
    return await handler(req, res, params)
  })
}

const safeGetHandler = (endpoint, handler, requiredParams) => {
  return safeHandleRequest(async (req, res) => {
    const params = parseUriParams(req.params)
    return await handler(req, res, params)
  })
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

  memberOrCreatorRoomRouteEndpoint(endpoint, handler, requiredParams=[]) {
    const middlewareList = [
      shared.api.middleware.requireRoomMemberOrCreator
    ]
    return this.roomRouteEndpoint(endpoint, handler, requiredParams, middlewareList)
  }

  memberRoomRouteEndpoint(endpoint, handler, requiredParams=[]) {
    const middlewareList = [
      shared.api.middleware.requireRoomMember
    ]
    return this.roomRouteEndpoint(endpoint, handler, requiredParams, middlewareList)
  }

  creatorOnlyRoomRouteEndpoint(endpoint, handler, requiredParams=[]) {
    const middlewareList = [
      shared.api.middleware.requireRoomCreator
    ]
    return this.roomRouteEndpoint(endpoint, handler, requiredParams, middlewareList)
  }

  roomRouteEndpoint(endpoint, handler, requiredParams=[], additionalMiddleware=[]) {
    const middlewareList = [
      shared.api.middleware.roomFromRoute,
      shared.api.middleware.requireRoom,
      ...additionalMiddleware
    ]
    return this.loggedInPostEndpoint(endpoint, handler, requiredParams, middlewareList)
  }

  magicCodeLoggedOut(endpoint, handler, requiredParams=[], additionalMiddleware=[]) {
    const requireMagicCode = async (req, res, next) => {
      const magic = await shared.db.magic.magicLinkByCode(req.body.code)
      if(!magic) {
        const error = new Error("Invalid magic code")
        error.errorCode =  shared.error.code.INVALID_CODE
        next(error)
      }
      req.magic = magic
      next()
    }
    additionalMiddleware.push(requireMagicCode)
    return this.loggedOutPostEndpoint(endpoint, handler, requiredParams, additionalMiddleware)
  }

  loggedInPostEndpoint(endpoint, handler, requiredParams=[], additionalMiddleware=[]) {
    log.app.info(`Initializing logged in POST: ${endpoint}`)
    const middlewareList = [
      shared.api.middleware.getActor,
      shared.api.middleware.requireActor,
      ...additionalMiddleware
    ]

    this.express.post(endpoint, middlewareList, safePostHandler(endpoint, handler, requiredParams))
  }

  loggedInGetEndpoint(endpoint, handler, requiredParams=[], additionalMiddleware=[]) {
    log.app.info(`Initializing logged in GET: ${endpoint}`)
    const middlewareList = [
      shared.api.middleware.getActor,
      shared.api.middleware.requireActor,
      ...additionalMiddleware
    ]
    this.express.get(endpoint, middlewareList, safeGetHandler(endpoint, handler, requiredParams))
  }

  loggedOutPostEndpoint(endpoint, handler, requiredParams=[], middlewareList=[]) {
    log.app.info(`Initializing logged out POST: ${endpoint}`)
    this.express.post(endpoint, middlewareList, safePostHandler(endpoint, handler, requiredParams))
  }

  loggedOutGetEndpoint(endpoint, handler, requiredParams=[], middlewareList=[]) {
    log.app.info(`Initializing logged out GET: ${endpoint}`)
    this.express.get(endpoint, middlewareList, safeGetHandler(endpoint, handler, requiredParams))
  }
}

module.exports = Zoo
