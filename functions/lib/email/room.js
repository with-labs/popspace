const SENDER = 'notify@with.so'

module.exports = {
  sendRoomInviteEmail: async (toEmail, roomName, inviteUrl) => {
    const owner = await db.rooms.ownerByRoomName(roomName)
    return await lib.email.named.sendRoomStatusEmail(
      'room_invite',
      toEmail,
      roomName,
      {
        ownerFirstName: owner.first_name,
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
