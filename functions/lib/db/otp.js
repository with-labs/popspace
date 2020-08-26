const cryptoRandomString = require('crypto-random-string');
const moment = require("moment")

const STANDARD_REQUEST_DURATION_MILLIS = 10 * 60 * 1000

class Otp {
  constructor() {

  }

  isExpired(entity) {
    if(!entity.expires_at) return false;
    return moment(entity.expires_at).valueOf() < moment.utc().valueOf()
  }

  verify(request, otp) {
    util.dev.log("Request", request)
    if(!request || request.otp != otp) {
      return { error: lib.db.ErrorCodes.otp.INVALID_OTP }
    }
    if(this.isExpired(request)) {
      return { error: lib.db.ErrorCodes.otp.EXPIRED_OTP }
    }
    if(request.resolved_at) {
      return { error: lib.db.ErrorCodes.otp.RESOLVED_OTP }
    }
    return {}
  }

  generate() {
    return cryptoRandomString({length: 64, type: 'url-safe'})
  }

  standardExpiration() {
    return moment(moment.utc().valueOf() + STANDARD_REQUEST_DURATION_MILLIS).utc().format()
  }
}

module.exports = new Otp()
