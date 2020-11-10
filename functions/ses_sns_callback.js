const lib = require("lib");
const env = lib.util.env.init(require("./env.json"))
const https = require('https');

const updateEmailStatus = async (messageId, statusAtField, body, message) => {
  const statRecord = {
    message_id: messageId
  }
  statRecord[statusAtField] = moment(body.Timestamp).utc().format()
  return await db.pg.massive.ses_email_stats.save(statRecord)
}

const processEmailNotification = async (messageId, body, message) => {
  switch(message.eventType) {
    case "Send":
      await updateEmailStatus(messageId, "sent_at", body, message)
      break
    case "Open":
      await updateEmailStatus(messageId, "opened_at", body, message)
      break
    case "Click":
      await updateEmailStatus(messageId, "clicked_at", body, message)
      break
  }
}

module.exports.handler = util.netlify.publicPostEndpoint(async (event, context, callback) => {
  // TODO: test how netlify processes text/plain

  // Oddly SNS passes its post data as text/plain vs json
  // the body is indeed json though
  /* Example
    '{
      "Type":"Notification",
      "MessageId":"4e6f1ff3-a3e9-51dc-81dd-47d05f3c928c",
      "TopicArn":"arn:aws:sns:us-east-2:623168153294:ses_funnel",
      "Subject":"Amazon SES Email Event Notification",
      "Message":"{
        \\"eventType\\":\\"Send\\",\\"mail\\":{\\"timestamp\\":\\"2020-11-10T02:27:33.302Z\\",\\"source\\":\\"notify@with.so\\",\\"sourceArn\\":\\"arn:aws:ses:us-east-2:623168153294:identity/notify@with.so\\",\\"sendingAccountId\\":\\"623168153294\\",\\"messageId\\":\\"010f0175affad736-37ab61b6-3ea5-49a6-babe-97301354959f-000000\\",\\"destination\\":[\\"alexey@with.so\\"],\\"headersTruncated\\":false,\\"headers\\":[{\\"name\\":\\"Content-Type\\",\\"value\\":\\"multipart/alternative; boundary=\\\\\\"--_NmP-3a13b79d7d98736d-Part_1\\\\\\"\\"},{\\"name\\":\\"X-Ses-Configuration-Set\\",\\"value\\":\\"with_ses\\"},{\\"name\\":\\"From\\",\\"value\\":\\"The With team <notify@with.so>\\"},{\\"name\\":\\"To\\",\\"value\\":\\"alexey@with.so\\"},{\\"name\\":\\"Subject\\",\\"value\\":\\"Welcome to With!\\"}
        ,{\\"name\\":\\"Message-ID\\",\\"value\\":\\"<e0c9c161-347b-3d0c-f5e9-c5d5e4348386@with.so>\\"},{\\"name\\":\\"Date\\",\\"value\\":\\"Tue, 10 Nov 2020 02:27:33 +0000\\"},{\\"name\\":\\"MIME-Version\\",\\"value\\":\\"1.0\\"}],\\"commonHeaders\\":{\\"from\\":[\\"The With team <notify@with.so>\\"],\\"date\\":\\"Tue, 10 Nov 2020 02:27:33 +0000\\",\\"to\\":[\\"alexey@with.so\\"],\\"messageId\\":\\"010f0175affad736-37ab61b6-3ea5-49a6-babe-97301354959f-000000\\",\\"subject\\":\\"Welcome to With!\\"},\\"tags\\":{\\"ses:operation\\":[\\"SendRawEmail\\"],\\"ses:configuration-set\\":[\\"with_ses\\"],\\"ses:source-ip\\":[\\"71.183.194.95\\"],\\"ses:from-domain\\":[\\"with.so\\"],\\"ses:caller-identity\\":[\\"with_ses\\"],\\"type\\":[\\"claim\\"]}},\\"send\\":{}}\\n",
        "Timestamp":"2020-11-10T02:27:33.472Z",
        "SignatureVersion":"1",
        "Signature":"O8yJ6366qE8nIHBHSwWd3JwxlwKxY41eXpwX7T/oGtTtGA+SYxyfjcIs8QDVMOZ5uPxW9sArZ9xr9bPxlCO2pF+TD2CLqvDdaSMBpWYaSz7hFQmJCWvTgE9Z/A5D0Tbu0xnbFu4g7Pv6XROTMB/WbqEcTTmQVb49iGXZhEPo3ANWhUhnrgUjUj3KaKSCuYIGhD8jwG0+877LiXuqUTLe6XnRKprx8hwS9kHo6INNi2cUrQCe6dcMmS+Vrlk8xBfavTPMhOZXhqtqe9hwcJ5rmr1torjIU85fObmMyhHEEkH8oREubBm1TrXkMMWo5yTrgvy4webDs8zpk2Tes2BR+A==",
        "SigningCertURL":"https://sns.us-east-2.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem",
        "UnsubscribeURL":"https://sns.us-east-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-2:623168153294:ses_funnel:fadb30e3-d317-4e36-a158-fdcc17b3e766"
      }'
    Message:
      {
        eventType: 'Send',
        mail: Object,
        send: Object
      }
    mail:
    '{
      "timestamp":"2020-11-10T02:27:33.302Z",
      "source":"notify@with.so",
      "sourceArn":"arn:aws:ses:us-east-2:623168153294:identity/notify@with.so",
      "sendingAccountId":"623168153294",
      "messageId":"010f0175affad736-37ab61b6-3ea5-49a6-babe-97301354959f-000000",
      "destination":["alexey@with.so"],
      "headersTruncated":false,
      "headers":[
        {
          "name":"Content-Type",
          "value":"multipart/alternative; boundary=\\"--_NmP-3a13b79d7d98736d-Part_1\\""
        },
        {
          "name":"X-Ses-Configuration-Set","value":"with_ses"
        },
        {
          "name":"From",
          "value":"The With team <notify@with.so>"
        },
        {
          "name":"To",
          "value":"alexey@with.so"
        },
        {
          "name":"Subject",
          "value":"Welcome to With!"
        },
        {
          "name":"Message-ID",
          "value":"<e0c9c161-347b-3d0c-f5e9-c5d5e4348386@with.so>"
        },
        {
          "name":"Date",
          "value":"Tue, 10 Nov 2020 02:27:33 +0000"
        },
        {
          "name":"MIME-Version",
          "value":"1.0"
        }],
      "commonHeaders":{
        "from":["The With team <notify@with.so>"],
        "date":"Tue, 10 Nov 2020 02:27:33 +0000",
        "to":["alexey@with.so"],
        "messageId":"010f0175affad736-37ab61b6-3ea5-49a6-babe-97301354959f-000000",
        "subject":"Welcome to With!"},
        "tags":{"ses:operation":["SendRawEmail"],
        "ses:configuration-set":["with_ses"],
        "ses:source-ip":["71.183.194.95"],
        "ses:from-domain":["with.so"],
        "ses:caller-identity":["with_ses"],
        "type":["claim"]
      }
    }'
  */
  const body = JSON.parse(req.body)
  const arn = req.headers["x-amz-sns-topic-arn"]
  const messageType = req.headers['x-amz-sns-message-type']
  const messageId = req.headers['x-amz-sns-message-id']
  try {
    const auth = await util.aws.authenticateSns(body)
    switch(messageType) {
      case 'SubscriptionConfirmation':
        https.get(body.SubscribeURL, (res) => {
          console.log("Subscribed to SNS topic")
        })
        break
      case 'Notification':
        const message = JSON.parse(body.Message)
        processEmailNotification(messageId, body, message)
        break
    }
  } catch (e) {
    console.log("Authentication failed")
  }

  res.sendStatus(200);
})

