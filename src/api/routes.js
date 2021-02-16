class Routes {

  publicInviteRoute(inviteEntry) {
    return `/invite/${inviteEntry.otp}?iid=${inviteEntry.id}`
  }
}

module.exports = new Routes()

