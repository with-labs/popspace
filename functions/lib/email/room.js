const SENDER = 'notify@with.so'

module.exports = {
  sendRoomInviteEmail: async (toEmail, url) => {
    const subject = `You've been invited to join a With.so room`
    const html = `Hi! Please follow <a href=${url}> this link </a> to join.`
    const plaintextFallback = `Please go to ${url} to join.`
    const tags = [{Name: "type", Value: "room_invite"}]
    return await lib.email.ses.sendMail(SENDER, toEmail, subject, html, plaintextFallback, tags)
  },

  sendRoomClaimEmail: async (toEmail, url) => {
    const subject = `Your with.so room is ready`
    const html = `Hi! Please follow <a href=${url}> this link </a> to claim your room.`
    const plaintextFallback = `Please go to ${url} to claim your room.`
    const tags = [{Name: "type", Value: "room_claim"}]
    return await lib.email.ses.sendMail(SENDER, toEmail, subject, html, plaintextFallback, tags)
  }
}
