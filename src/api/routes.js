class Routes {
  publicInviteRoute(inviteEntry) {
    return `/join/${inviteEntry.otp}?iid=${inviteEntry.id}`
  }
}

module.exports = new Routes()

