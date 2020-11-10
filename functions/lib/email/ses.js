const nodemailer = require('nodemailer');
const aws = require('aws-sdk');

class Ses {
  constructor() {
    this.transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: '2020-08-01',
        accessKeyId: process.env.AWS_SES_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SES_SECRET_KEY,
        region: "us-east-2"
      }),
      sendingRate: 20 // max per second
    })
  }

  async logSesSendResponse(emailMessage, to, err, info) {
    /*
      info example:
      { envelope: { from: 'with.dev@with.so', to: [ 'alexey@with.so' ] },
          messageId:
           '<010f017429807cac-2a8ac917-a289-4ce9-8329-4c1634119431-000000@us-east-2.amazonses.com>',
          response:
           '010f017429807cac-2a8ac917-a289-4ce9-8329-4c1634119431-000000',
          raw:
           <Buffer 43 6f 6e 74 65 6e 74 2d 54 79 70 65 3a 20 74 65 78 74 2f 70 6c 61 69 6e 3b 20 63 68 61 72 73 65 74 3d 75 74 66 2d 38 0d 0a 46 72 6f 6d 3a 20 77 69 74 ... > }
      error docs:
        https://docs.aws.amazon.com/ses/latest/DeveloperGuide/using-ses-api-responses.html
    */
    if(err) {
      log.email.error(`Failed to send ${emailMessage.name} to ${to}`, err)
      return await db.pg.massive.ses_email_messages.update({id: emailMessage.id}, {
        aws_responded_at: db.time.now(),
        error: err
      })
    } else {
      log.email.info(`Sent ${emailMessage.name}`, info)
      return await db.pg.massive.ses_email_messages.update({id: emailMessage.id}, {
        aws_responded_at: db.time.now(),
        response: info.response,
        message_id: info.messageId
      })
    }
  }

  async logSesRequest(emailName, version, from, to) {
    log.email.info(`Sending ${emailName}: ${from} -> ${to}`)
    const result = await db.pg.massive.ses_email_messages.insert({
      name: emailName,
      version: version,
      to_email: to,
      aws_requested_at: db.time.now()
    })
    return result
  }

  async sendMail(emailName, version, from, to, subject, html, plaintextFallback, tags, user) {
    if(user) {
      to = `${user.display_name} <${user.email}>`
    }
    const headers = {}
    if(process.env.NODE_ENV == "production") {
      // track send/open data only in production for now
      headers['X-SES-CONFIGURATION-SET'] = 'with_ses'
    }
    return new Promise(async (resolve, reject) => {
      const emailMessage = await this.logSesRequest(emailName, version, from, to)
      this.transporter.sendMail({
        from: `"The With team" <${from}>`,
        to: to,
        subject: subject,
        html: html,
        text: plaintextFallback,
        ses: {
          Tags: tags
        },
        headers: headers
      }, async (err, info) => {
        await this.logSesSendResponse(emailMessage, to, err, info)
        if(err) {
          reject(err)
        } else {
          resolve(info)
        }
      })
    })
  }
}

module.exports = new Ses()
