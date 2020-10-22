const SENDER = 'notify@with.so'

module.exports = {

  sendMarketingTest: async (toEmail, appUrl) => {
    const subject = `Marketing test`
    const tags = [{Name: "type", Value: "room_claim"}]

    const user = await db.pg.massive.users.findOne({email: toEmail})
    if(!user) {
      throw `Email not registered ${toEmail}`
    }

    const magicLink = await db.magic.createUnsubscribe(user.id)
    const unsubscribeUrl = await lib.db.magic.unsubscribeUrl(appUrl, magicLink)

    const html = `
      <body style="padding: 0px !important; margin: 0px !important; background: white;">
        <a href="${unsubscribeUrl}"> Unsubscribe </a>
      </body>
    `

    const plaintextFallback = `
      Fallback test message
    `

    return await lib.email.ses.sendMail(SENDER, toEmail, subject, html, plaintextFallback, tags)
  }
}
