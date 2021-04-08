const SENDER = 'notify@with.so'


function rfc3986EncodeURIComponent (str) {
  /*
    Apparently, apostrophes aren't escapde by default.

    Also apparently, if you fail to escape them in a URL in an email context, it won't work.

    What will happen is the apostrophe will be the end of the URL in the email, truncating the rest of the contents.

    https://stackoverflow.com/questions/18251399/why-doesnt-encodeuricomponent-encode-single-quotes-apostrophes
  */
  return encodeURIComponent(str).replace(/[!'()*]/g, escape)
}

const getCalendarUrls = (namedRoom, inviteLink) => {
  const eventTitle = "Team sync-up"

  let nextMonday = new Date()
  nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7)

  const year = nextMonday.getFullYear()
  const month = (nextMonday.getMonth() < 9) ? "0" + (nextMonday.getMonth() + 1) : nextMonday.getMonth() + 1
  const day = (nextMonday.getDate() < 10) ? "0" + nextMonday.getDate() : nextMonday.getDate()

  const googleDate = year + "" + month + "" + day // YYYYMMDD
  const outlookDate = year + "-" + month + "-" + day // YYYY-MM-DD
  const detail = rfc3986EncodeURIComponent(`Join the room ${namedRoom.displayName()} at ${inviteLink}`)
  const googleUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?dates=${googleDate}T130000Z/${googleDate}T140000Z&details=${detail}&text=${eventTitle}`
  /*
    Outlook has a bug where on first login, it will display spaces as +
    https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/issues/20

    There are 2 proposed solutions: use thin spaces (%E2%80%89) or HTML spaces (%26%2332;).
    Using HTML spaces for now for normal rendering.
  */
  const outlookBody = detail.replace(/%20/g, "%26%2332;")
  const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?body=${outlookBody}&enddt=${outlookDate}T14%3A00%3A00%2B00%3A00&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=${outlookDate}T13%3A00%3A00%2B00%3A00&subject=${eventTitle}`

  return {
    googleUrl,
    outlookUrl
  }
}


const getInviteLink = (appUrl, inviteEntry) => {
   return `${appUrl}/join/?otp=${rfc3986EncodeURIComponent(inviteEntry.otp)}&iid=${rfc3986EncodeURIComponent(inviteEntry.id)}`
}

const subscribeUrl = (appUrl, subscribeMagic) => {
  return `${appUrl}/subscribe/?otp=${rfc3986EncodeURIComponent(subscribeMagic.otp)}&mlid=${rfc3986EncodeURIComponent(subscribeMagic.id)}`
}

module.exports = {
  sendSignupOtpEmail: async (toEmail, loginUrl) => {
    return await lib.email.named.sendNamedTransactionEmail(
      "welcome",
      toEmail,
      { ctaUrl: loginUrl }
    )
  },

  sendLoginOtpEmail: async (toEmail, loginUrl) => {
    return await lib.email.named.sendNamedTransactionEmail(
      "signin",
      toEmail,
      { ctaUrl: loginUrl }
    )
  },

  sendWelcomeFollowupEmail: async (user, appUrl, namedRoom) => {
    const subscribeMagic = await shared.db.magic.createSubscribe(user.id)
    const inviteEntries = await shared.db.room.invites.getActivePublicInvites(namedRoom.roomId())
    const inviteLink = getInviteLink(appUrl, inviteEntries[0])
    const calendarUrls = getCalendarUrls(namedRoom, inviteLink)
    return await lib.email.named.sendRoomStatusEmail(
      'welcome_followup',
      user.email,
      namedRoom.route(),
      {
        ownerFirstName: user.first_name,
        roomDisplayName: namedRoom.displayName(),
        googleCalendarUrl: calendarUrls.googleUrl,
        outlookCalendarUrl: calendarUrls.outlookUrl,
        subscribeUrl: subscribeUrl(appUrl, subscribeMagic),
        inviteLink: inviteLink
      }
    )
  }

}

