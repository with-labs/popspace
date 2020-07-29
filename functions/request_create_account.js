require("dotenv").config()
const cryptoRandomString = require('crypto-random-string');
const db = require("db");


/*
Sign up flow

1. Generate URL-safe OTP
2. Store account create request in redis as {email: params}
3. Send email with OTP link
4. If OTP link is opened, an account_create_resolve endpoint is called with the email+OTP parsed out of the link
5. Create/store JWT session cookie
6. Endpoints requiring authorization can check JWT
*/



const headers = {
  'Content-Type': 'application/json'
};


const newUserCreateRequest = async (params)  => {
  const otp = cryptoRandomString({length: 64, type: 'url-safe'})
  // TODO: store params in redis once it's spun up; key by email, add OTPs
  const accountRedis = new db.redis.AccountsRedis();
  const alreadyRequested = await accountRedis.getAccountCreateRequest(params.email);
  if(alreadyRequested) return null;

  await accountRedis.writeAccountCreateRequest(params, otp)

  return otp
}

const sendOtpEmail = async (params, otp) => {
  // TODO: send email
  console.log(`Sending ${otp} to email: ${params.email}`)
}

module.exports.handler = async (event, context, callback) => {
  // We only care about POSTs with body data
  if(event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({success: false, message: "Must provide POST body"})
    });
  }

  const params = JSON.parse(event.body)
  const otp = await newUserCreateRequest(params)
  if(!otp) {
    return callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({success: false})
    })
  }
  await sendOtpEmail(params, otp)

  callback(null, {
    statusCode: 200,
    headers,
    body: JSON.stringify({success: true})
  })
}
