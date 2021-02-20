const http = {
  fail: async (req, res, message, data={}, httpCode=http.code.BAD_REQUEST) => {
    data.message = data.message || "Unknown error"
    const error = Object.assign(lib.util.snakeToCamelCase(data), {message: message, success: false})
    res.status(httpCode)
    res.send(error)
  },

  succeed: async (req, res, data={}, httpCode=http.code.OK) => {
    res.send(Object.assign(lib.util.snakeToCamelCase(data), {success: true}))
  },

  authFail: async (errorCode, callback) => {
    const errorDetails = { errorCode: errorCode }
    switch(errorCode) {
      case shared.error.code.REVOKED_OTP:
        return await http.fail(callback, "This code has been revoked.", errorDetails);
      case shared.error.code.INVALID_OTP:
        return await http.fail(callback, "Invalid one-time passcode.", errorDetails);
      case shared.error.code.EXPIRED_OTP:
        return await http.fail(callback, "Sorry, this link has expired.", errorDetails);
      case shared.error.code.RESOLVED_OTP:
        // We could be more elaborate and try to figure out if it's the current user
        // and whether they already have access to the OTP-protected resource
        return await http.fail(callback, "This code is no longer valid.", errorDetails);
      case shared.error.code.UNEXPECTER_ERROR:
        // TODO: ERROR_LOGGING
        return await http.fail(callback, "An unexpected error happened. Please try again.", errorDetails);
      default:
        return await http.fail(callback, "An unexpected error happened. Please try again.", errorDetails);
    }
  },

  code: {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    IM_A_TEAPOT: 418,
    MISDIRECTED_REQUEST: 421,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    TOO_EARLY: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  }
}

module.exports = http
