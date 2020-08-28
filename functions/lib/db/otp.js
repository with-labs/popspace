const cryptoRandomString = require('crypto-random-string');
const moment = require("moment")

const STANDARD_REQUEST_DURATION_MILLIS = 60 * 60 * 1000

module.exports = {
  isExpired: (entity) => {
    if(!entity.expires_at) return false;
    return moment(entity.expires_at).valueOf() < moment.utc().valueOf()
  },

  verify: (request, otp) => {
    if(!request || request.otp != otp) {
      return { error: lib.db.ErrorCodes.otp.INVALID_OTP }
    }
    if(this.isExpired(request)) {
      return { error: lib.db.ErrorCodes.otp.EXPIRED_OTP }
    }
    if(request.resolved_at) {
      return { error: lib.db.ErrorCodes.otp.RESOLVED_OTP }
    }
    return { error: null, result: null }
  },

  generate: () => {
    return cryptoRandomString({length: 64, type: 'url-safe'})
  },

  standardExpiration: () => {
    return moment(moment.utc().valueOf() + STANDARD_REQUEST_DURATION_MILLIS).utc().format()
  },

  handleAuthFailure:(errorCode, callback) => {
    switch(errorCode) {
      case lib.db.ErrorCodes.otp.INVALID_OTP:
        return util.http.fail(callback, "Invalid one-time passcode.");
      case lib.db.ErrorCodes.otp.EXPIRED_OTP:
        return util.http.fail(callback, "Sorry, this link has expired. Please sign up again.");
      case lib.db.ErrorCodes.otp.RESOLVED_OTP:
        return util.http.fail(callback, "It seems this link has already been used to log in. Please try again.");
      case lib.db.ErrorCodes.UNEXPECTER_ERROR:
        // TODO: ERROR_LOGGING
        return util.http.fail(callback, "An unexpected error happened. Please try again.");
      default:
        return util.http.fail(callback, "An unexpected error happened. Please try again.");
    }
  }

}
