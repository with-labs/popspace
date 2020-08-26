const SENDER = 'with.dev@with.so'

class AccountEmails {
  constructor() {
    this.ses = lib.email.ses
  }

  async sendSignupOtpEmail(toEmail, firstName, url) {
    const subject = `Welcome to with.so, ${firstName}!`
    const html = `To finish your signup process and log in, please click <a href='${url}'>this link</a>.`
    const plaintextFallback = `To finish your signup process and log in, please open the folowing url: ${url}`
    const tags = [{"type": "signup"}]
    return await this.ses.sendMail(SENDER, toEmail, subject, html, plaintextFallback, tags)
  }

  async sendLoginOtpEmail(toEmail, firstName, url) {
    const subject = `Log in to with.so`
    const html = `Hi ${firstName}! <br/> To log in to with.so, please click <a href='${url}'>this link</a>.`
    const plaintextFallback = `To log in to with.so, please open the folowing url: ${url}`
    const tags = [{"type": "signup"}]
    return await this.ses.sendMail(SENDER, toEmail, subject, html, plaintextFallback, tags)
  }

}

module.exports = new AccountEmails()
