const SENDER = 'notify@with.so'

class NamedEmails {
  async sendNamedUserMarketingEmail(name, userId, arg={}) {
    const email = await db.dynamo.getLatestEmail(name)
    if(!email) {
      throw `No such email: ${name}`
    }
    const user = await db.accounts.userById(userId)
    if(!user) {
      throw "No such user"
    }

    const magicLink = await db.magic.createUnsubscribe(user.id)

    arg.firstName = user.first_name
    arg.email = user.email
    arg.appUrl = `${global.gcfg.appUrl()}/`
    arg.ctaUrl = `${global.gcfg.appUrl()}/${util.routes.static.dashboard()}`
    arg.unsubscribeUrl = await lib.db.magic.unsubscribeUrl(gcfg.appUrl(), magicLink)

    const tags = [{Name: "type", Value: name}]
    const subject = eval(`\`${email.subject}\``)
    const html = eval(`\`${email.html}\``)
    const plaintext = eval(`\`${email.plaintext}\``)

    return await lib.email.ses.sendMail(SENDER, user.email, subject, html, plaintext, tags)
  }

  async sendWhatsNew(userId) {
    return await this.sendNamedUserMarketingEmail("marketing", userId)
  }
}

module.exports = new NamedEmails()
