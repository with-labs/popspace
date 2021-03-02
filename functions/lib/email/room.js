const SENDER = 'notify@with.so'

const getDisplayName = async (roomId) {
  const roomState = await shared.db.dynamo.room.getRoomState(roomId)
  return roomState.display_name
}

module.exports = {
  sendRoomInviteEmail: async (toEmail, roomRoute, inviteUrl, inviterUser, room) => {
    const roomDisplayName = await getDisplayName(room.id)
    return await lib.email.named.sendRoomStatusEmail(
      'room_invite',
      toEmail,
      roomRoute,
      {
        // TODO: we should update the email to rely on
        // inviterFirstName so it's named appropriately.
        // Meantime, pass both
        ownerFirstName: inviterUser.first_name,
        inviterFirstName: inviterUser.first_name,
        ctaUrl: inviteUrl,
        roomDisplayName: roomDisplayName || roomRoute
      }
    )
  },

  sendRoomClaimEmail: async (toEmail, roomRoute, claimRoomCtaUrl) => {
    /*
      Claim emails have the same room route as display name
      when they are created - holdover from early routing/naming.
    */
    const roomDisplayName = roomRoute
    return await lib.email.named.sendRoomStatusEmail(
      "claim",
      toEmail,
      roomRoute,
      { ctaUrl: claimRoomCtaUrl, roomDisplayName: roomDisplayName }
    )
  }
}
