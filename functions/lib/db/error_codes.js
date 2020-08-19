module.exports = {
  otp: {
    UNEXPECTER_ERROR: -1,
    // Don't use 0 since it's false-y and is fertile grounds for programming error
    INVALID_OTP: 1,
    EXPIRED_OTP: 2,
    RESOLVED_OTP: 3
  }
}
