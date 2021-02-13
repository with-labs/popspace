class Routes {

  publicInviteRoute(otp) {
    return `/invite/${otp}`
  }
}

module.exports = new Routes()
