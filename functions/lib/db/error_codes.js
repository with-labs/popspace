module.exports = {
  // Don't use 0 since it's false-y and is fertile grounds for programming error
  UNEXPECTER_ERROR: -1,
  otp: {
    INVALID_OTP: 1,
    EXPIRED_OTP: 2,
    RESOLVED_OTP: 3,
    INVALID_ACTION: "INVALID_ACTION"
  },

  room: {
    TOO_MANY_OWNED_ROOMS: 1,
    ALREADY_INVITED: 2,
    UNKNOWN_ROOM: 3,
    CLAIM_UNIQUENESS: 4,
    UNAUTHORIZED_ROOM_ACCESSS: "UNAUTHORIZED_ROOM_ACCESSS",
    ALREADY_CLAIMED: "ALREADY_CLAIMED"
  },

  user: {
    ALREADY_REGISTERED: 1,
    // We prefer string error codes but thave not yet fully migrated towards them
    UNAUTHORIZED: "UNAUTHORIZED_USER",
    ADMIN_ONLY_RESTRICTED: "ADMIN_ONLY_RESTRICTED",
    NO_SUCH_USER: "NO_SUCH_USER"
  }
}
