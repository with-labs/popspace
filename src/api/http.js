const http = {
  fail: async (req, res, message, data={}) => {
    data.message = data.message || "Unknown error"
    const error = Object.assign(lib.util.snakeToCamelCase(data), {message: message, success: false})
    res.send(error)
  },

  succeed: async (req, res, data={}) => {
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
  }
}

module.exports = http
