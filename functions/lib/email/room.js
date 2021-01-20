const SENDER = 'notify@with.so'

module.exports = {
  sendRoomInviteEmail: async (toEmail, roomName, inviteUrl, inviterUser) => {
    return await lib.email.named.sendRoomStatusEmail(
      'room_invite',
      toEmail,
      roomName,
      {
        // TODO: we should update the email to rely on
        // inviterFirstName so it's named appropriately.
        // Meantime, pass both
        ownerFirstName: inviterUser.first_name,
        inviterFirstName: inviterUser.first_name,
        ctaUrl: inviteUrl
      }
    )
  },

  sendRoomClaimEmail: async (toEmail, roomName, claimRoomCtaUrl) => {
    return await lib.email.named.sendRoomStatusEmail(
      "claim",
      toEmail,
      roomName,
      { ctaUrl: claimRoomCtaUrl }
    )
  }
}
