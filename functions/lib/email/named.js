const SENDER = 'notify@with.so'

const getEmail = async (name) => {
  const email = await db.dynamo.getLatestEmail(name)
  if(!email) {
    throw `No such email: ${name}`
  }
  return email
}

const appUrl = () => {
  return `${global.gcfg.appUrl()}`
}

const templateInArgs = (template, arg) => {
  return eval(`\`${template}\``)
}

const fetchAndProcessEmail = async (emailName, arg) => {
  const email = await getEmail(emailName)
  return {
    subject: templateInArgs(email.subject, arg),
    html: templateInArgs(email.html, arg),
    plaintext: templateInArgs(email.plaintext, arg),
    name: emailName,
    version: email.version
  }
}

const fetchEmailAndSend = async (emailName, toEmailAddress, arg) => {
  const e = await fetchAndProcessEmail(emailName, arg)
  const tags = [{Name: "type", Value: emailName}]
  return await lib.email.ses.sendMail(e.name, e.version, SENDER, toEmailAddress, e.subject, e.html, e.plaintext, tags)
}

class NamedEmails {
  async sendNamedUserMarketingEmail(name, email, arg={}) {
    const user = await db.accounts.userByEmail(email)
    if(!user) {
      throw "No such user"
    }
    const magicLink = await db.magic.createUnsubscribe(user.id)
    arg.firstName = user.first_name
    arg.email = user.email
    arg.appUrl = appUrl()
    arg.ctaUrl = arg.ctaUrl || `${arg.appUrl}/${util.routes.static.dashboard()}`
    arg.unsubscribeUrl = await lib.db.magic.unsubscribeUrl(gcfg.appUrl(), magicLink)
    await fetchEmailAndSend(name, user.email, arg)
  }

  async sendNamedTransactionEmail(name, email, arg={}) {
    const user = await db.accounts.userByEmail(email)
    if(!user) {
      throw "No such user"
    }
    arg.firstName = user.first_name
    arg.email = email
    arg.appUrl = appUrl()
    arg.ctaUrl = arg.ctaUrl || `${arg.appUrl}/${util.routes.static.dashboard()}`
    await fetchEmailAndSend(name, user.email, arg)
  }

  async sendWhatsNew(email) {
    return await this.sendNamedUserMarketingEmail("marketing", email)
  }

  async sendRoomStatusEmail(name, toEmail, roomName, arg={}) {
    arg.roomName = roomName
    arg.appUrl = appUrl()
    await fetchEmailAndSend(name, toEmail, arg)
  }
}

module.exports = new NamedEmails()
