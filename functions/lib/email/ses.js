let nodemailer = require('nodemailer');
let aws = require('aws-sdk');

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

  // tags format: [{Name: "", Value: ""}]
  async sendMail(from, to, subject, html, plaintextFallback, tags, user) {
    if(user) {
      to = `${user.display_name} <${user.email}>`
    }
    return new Promise((resolve, reject) => {
      this.transporter.sendMail({
        from: `"The With team" <${from}>`,
        to: to,
        subject: subject,
        html: html,
        text: plaintextFallback,
        ses: {
          Tags: tags
        }
      }, (err, info) => {
        if(err) {
          reject(err)
        } else {
          resolve(info)
        }
        /* TODO:
         * Error reporting
         * We may also want to log the info:
         * Example:
          { envelope: { from: 'with.dev@with.so', to: [ 'alexey@with.so' ] },
            messageId:
             '<010f017429807cac-2a8ac917-a289-4ce9-8329-4c1634119431-000000@us-east-2.amazonses.com>',
            response:
             '010f017429807cac-2a8ac917-a289-4ce9-8329-4c1634119431-000000',
            raw:
             <Buffer 43 6f 6e 74 65 6e 74 2d 54 79 70 65 3a 20 74 65 78 74 2f 70 6c 61 69 6e 3b 20 63 68 61 72 73 65 74 3d 75 74 66 2d 38 0d 0a 46 72 6f 6d 3a 20 77 69 74 ... > }

         * But likely we want to follow through and track the opens/click if we do any kind of tracking
         * For just signups, it's not very useful data
         */
      })
    })
  }
}

module.exports = new Ses()
