const SENDER = 'notify@with.so'


class AccountEmails {
  constructor() {
  }

  async sendSignupOtpEmail(toEmail, loginUrl) {
    return await lib.email.named.sendNamedTransactionEmail(
      "welcome",
      toEmail,
      { ctaUrl: loginUrl }
    )
  }

  async sendLoginOtpEmail(toEmail, loginUrl) {
    return await lib.email.named.sendNamedTransactionEmail(
      "signin",
      toEmail,
      { ctaUrl: loginUrl }
    )
  }

}

module.exports = new AccountEmails()
