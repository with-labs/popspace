const cryptoRandomString = require('crypto-random-string');
const moment = require("moment")

const STANDARD_REQUEST_DURATION_MILLIS = 60 * 60 * 1000
const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000

const otplib = {
  isExpired: (entity) => {
    if(!entity.expires_at) return false;
    return moment(entity.expires_at).valueOf() < moment.utc().valueOf()
  },

  // prioritizes IS_VALID -> IS_RESOLVED -> IS_EXPIRED
  verify: (request, otp) => {
    if(!request || request.otp != otp || request.revoked_at) {
      return { error: lib.db.ErrorCodes.otp.INVALID_OTP }
    }
    if(request.resolved_at) {
      return { error: lib.db.ErrorCodes.otp.RESOLVED_OTP }
    }
    if(otplib.isExpired(request)) {
      return { error: lib.db.ErrorCodes.otp.EXPIRED_OTP }
    }
    return { error: null, result: null }
  },

  generate: () => {
    return cryptoRandomString({length: 64, type: 'url-safe'})
  },

  standardExpiration: () => {
    return moment(moment.utc().valueOf() + STANDARD_REQUEST_DURATION_MILLIS).utc().format()
  },

  expirationInNDays: (n) => {
    return moment(moment.utc().valueOf() + ONE_DAY_MILLIS * n).utc().format()
  },

  handleAuthFailure: async (errorCode, callback) => {
    const errorDetails = { errorCode: errorCode }
    switch(errorCode) {
      case lib.db.ErrorCodes.otp.INVALID_OTP:
        return await util.http.fail(callback, "Invalid one-time passcode.", errorDetails);
      case lib.db.ErrorCodes.otp.EXPIRED_OTP:
        return await util.http.fail(callback, "Sorry, this link has expired.", errorDetails);
      case lib.db.ErrorCodes.otp.RESOLVED_OTP:
        // We could be more elaborate and try to figure out if it's the current user
        // and whether they already have access to the OTP-protected resource
        return await util.http.fail(callback, "This code is no longer valid.", errorDetails);
      case lib.db.ErrorCodes.UNEXPECTER_ERROR:
        // TODO: ERROR_LOGGING
        return await util.http.fail(callback, "An unexpected error happened. Please try again.", errorDetails);
      default:
        return await util.http.fail(callback, "An unexpected error happened. Please try again.", errorDetails);
    }
  }

}

module.exports = otplib
