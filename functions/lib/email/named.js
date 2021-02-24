const SENDER = "notify@with.so"

const getEmail = async (name) => {
  const email = await lib.db.dynamo.getLatestEmail(name)
  if (!email) {
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

const fetchEmailAndSend = async (emailName, toEmailAddress, arg, trackClicks=true) => {
  const e = await fetchAndProcessEmail(emailName, arg)
  const tags = [{ Name: "type", Value: emailName }]
  return await lib.email.ses.sendMail(
    e.name,
    e.version,
    SENDER,
    toEmailAddress,
    e.subject,
    e.html,
    e.plaintext,
    tags,
    trackClicks
  )
}

class NamedEmails {
  async sendNamedUserMarketingEmail(name, email, arg = {}) {
    const user = await shared.db.accounts.userByEmail(email)
    if (!user) {
      throw "No such user"
    }
    const magicLink = await lib.db.magic.createUnsubscribe(user.id)
    arg.firstName = user.first_name
    arg.email = user.email
    arg.appUrl = appUrl()
    arg.ctaUrl = arg.ctaUrl || `${arg.appUrl}/${util.routes.static.dashboard()}`
    arg.unsubscribeUrl = await lib.db.magic.unsubscribeUrl(
      gcfg.appUrl(),
      magicLink
    )
    await fetchEmailAndSend(name, user.email, arg, true)
  }

  async sendNamedTransactionEmail(name, email, arg = {}) {
    const user = await shared.db.accounts.userByEmail(email)
    if (!user) {
      // if no user exists, we fall back to look for an account creation request, which
      // is basically a pending account. That lets us send emails to people who have
      // signed up but not finished account creation.
      const account_request = await shared.db.accounts.getLatestAccountCreateRequest(
        email
      )
      if (!account_request) {
        throw new Error("No such user")
      }
      arg.firstName = account_request.first_name
    } else {
      arg.firstName = user.first_name
    }
    arg.email = email
    arg.appUrl = appUrl()
    arg.ctaUrl = arg.ctaUrl || `${arg.appUrl}/${util.routes.static.dashboard()}`
    await fetchEmailAndSend(name, email, arg, false)
  }

  async sendWhatsNew(email) {
    return await this.sendNamedUserMarketingEmail("marketing", email)
  }

  async sendRoomStatusEmail(name, toEmail, roomName, arg = {}) {
    arg.roomName = roomName
    arg.appUrl = appUrl()
    await fetchEmailAndSend(name, toEmail, arg, false)
  }
}

module.exports = new NamedEmails()
