const getRequestSignature = (req) => {
  const values = [
    req.path,
    `uid ${req.user ? req.user.id : 'none'}`,
    `body ${JSON.stringify(req.body)}`,
    `ip ${req.ip}`
  ]
  return values.join(", ")
}

const http = {
  fail: async (req, res, error={}, httpCode=shared.api.http.code.BAD_REQUEST) => {
    error.message = error.message || "Unknown error"
    error.success = false
    log.response.info(`Fail (${getRequestSignature(req)})`)
    res.status(httpCode)
    let result = error
    if(error.toJson) {
      /*
        This means that it's a JS Error/exception error.
        It's nice to have stack traces included with error messages,
        so we should use this style.

        The alternative is a POJO, which we semi-support for now,
        since that's what we used to do.
      */
      result = error.toJson()
      /* The message field does not serialize for whatever reason */
      result.message = error.message
    } else {
      /*
        Let's start getting rid of them
      */
      log.error.warn("Non-JS Error in HTTP fail", error)
    }
    return res.send(lib.util.snakeToCamelCase(result))
  },

  succeed: async (req, res, data={}, httpCode=shared.api.http.code.OK) => {
    log.response.info(`Success (${getRequestSignature(req)})`)
    res.send(Object.assign(lib.util.snakeToCamelCase(data), {success: true}))
  },

  authFail: async (req, res, errorCode) => {
    const error = { errorCode: errorCode }
    switch(errorCode) {
      case shared.error.code.REVOKED_CODE:
        error.message = "This code has been revoked."
        break
      case shared.error.code.INVALID_CODE:
        error.message = "Invalid code."
        break
      case shared.error.code.EXPIRED_CODE:
        error.message = "Sorry, this code has expired."
        break
      case shared.error.code.RESOLVED_CODE:
        // We could be more elaborate and try to figure out if it's the current user
        // and whether they already have access to the OTP-protected resource
        error.message = "This code is no longer valid."
        break
      case shared.error.code.MAGIC_CODE_INVALID_ACTION:
        error.message = "Invalid magic code action."
        break
      case shared.error.code.UNEXPECTER_ERROR:
        log.error.error(`authFail with unexpected error (user: ${req.user ? req.user.id : 'no user'}, url: ${req.url}, body: ${req.body})`)
        error.message = "An unexpected error happened. Please try again."
        break
      default:
        log.error.error(`authFail critical error (user: ${req.user ? req.user.id : 'no user'}, url: ${req.url}, body: ${req.body})`)
        error.message = "An unexpected error happened. Please try again."
        break
    }
    return http.fail(req, res, error)
  },

}

module.exports = http
