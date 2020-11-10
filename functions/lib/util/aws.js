const MessageValidator = require('sns-validator')
module.exports = {
  authenticateSns: async (body) => {
    const validator = new MessageValidator();
    return new Promise((resolve, reject) => {
      validator.validate(body, (err, message) => {
        /* Note:
          IMO there is a security issue here.
          This is amazon's official package for verifying sns signatures,
          and it follows amazon's official guidelines for verification:
          https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html

          as part of the recommended process, a certificate is fetched from
          a URL in the message, which checks the signature in the message.

          It seems I could simply set the certificate URL to my own certificate,
          and create a signature with that certificate's private key.

          The package does not check whether the URL is an amazon URL (which
          could be sufficient, since certificates are tied to URLs).

          Perhaps the best way to handle this is to subscribe to SNS via a
          lambda and only allow that SNS funnel to trigger the lambda.
          Hardcoding the certificate is an obvious improvement here, but
          we'd have to make sure to update the certificates if they change -
          so perhaps sidestepping the need by issuing IAM restrictions is best.

          We can live with this for the time being. If we're exposed,
          we just risk getting some invalid open/click data for emails.

          body on 11/09/2020:
          {
            Type: 'SubscriptionConfirmation',
            MessageId: '9eb0a458-35d9-487a-bb70-18df611510c6',
            Token: '2336412f37fb687f5d51e6e2425f004b4726929e5b44e6f8bfde97f39c57adc114716ca9e8f5990852900b87286065886efdce7f35c9d940f85e135596cf89034e3e4557b96f0524361d22cde7daa087a29f297345b70698c432ae966b9cb3a524a6e8067d95c7de7b6f73fe8e3a1513',
            TopicArn: 'arn:aws:sns:us-east-2:623168153294:ses_funnel',
            Message: 'You have chosen to subscribe to the topic arn:aws:sns:us-east-2:623168153294:ses_funnel.\n' +
              'To confirm the subscription, visit the SubscribeURL included in this message.',
            SubscribeURL: 'https://sns.us-east-2.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:us-east-2:623168153294:ses_funnel&Token=2336412f37fb687f5d51e6e2425f004b4726929e5b44e6f8bfde97f39c57adc114716ca9e8f5990852900b87286065886efdce7f35c9d940f85e135596cf89034e3e4557b96f0524361d22cde7daa087a29f297345b70698c432ae966b9cb3a524a6e8067d95c7de7b6f73fe8e3a1513',
            Timestamp: '2020-11-09T21:44:01.961Z',
            SignatureVersion: '1',
            Signature: 'eX1gFB4zhN9+KhnbcAQp1SmoKjsw+htNlQErKHur6+jatsiMz/36nfDkWEF5C5td0L1agd/pOwICjBA+0ISjAFqc+vooBTv40sIXmH52dF+Xw9GQyWyMiSjTulBrljMmwjmOkfWx6+XeUaN+X4pN5jO8iwmh9PKaZND0G7v0L1PQCbjLfi95tbbJrnth2QtxOcJoDh0Ox5H/zYgIualNhEnijfuQyFrNXrINCrvJ1c16M/bqhXk1X/2xF15OS1I4pJ/V7WP2xVnvF4tv1WpvGdUaFkbrRRIH0JkplcbvwIYYsdp03iFL4tjOrjlOcCFO/TRlApLYuQZj9mk0qY5r4Q==',
            SigningCertURL: 'https://sns.us-east-2.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem'
          }
        */
        if (err) {
          return reject(err)
        }
        resolve(message)
      });
    })
  }
}
