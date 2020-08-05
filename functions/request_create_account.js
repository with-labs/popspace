require("dotenv").config()
const cryptoRandomString = require('crypto-random-string');
const db = require("db");
const utils = require("utils");

/*
Sign up flow

1. Generate URL-safe OTP
2. Store account create request in redis as {email: params}
3. Send email with OTP link
4. If OTP link is opened, a resolve_create_account endpoint is called with the email+OTP parsed out of the link
5. Create/store session in redis/localStorage
*/

const accountRedis = new db.redis.AccountsRedis();

const newUserCreateRequest = async (params)  => {
  const otp = cryptoRandomString({length: 64, type: 'url-safe'})
  // If this email already requested an account create, inavlidate the old request
  // const signupUrl = `${process.env.APP_HOST}/.netlify/functions/resolve_create_account?otp=${otp}&email=${params.email}`
  const protocol = process.env.NODE_ENV == "development" ? "http" : "https"
  const signupUrl = `${protocol}://${process.env.APP_HOST}/complete_signup?otp=${otp}&email=${params.email}`
  await accountRedis.writeAccountCreateRequest(params, otp)
  return signupUrl
}

const sendOtpEmail = async (params, signupUrl) => {
  // TODO:  send email
  console.log(`Sending ${signupUrl} to email: ${params.email}`)
}

module.exports.handler = async (event, context, callback) => {
  // We only care about POSTs with body data
  if(utils.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  const signupUrl = await newUserCreateRequest(params)
  if(!signupUrl) {
    return utils.http.fail(callback, "Email already registered. Check your email for a verification link.")
  }
  await sendOtpEmail(params, signupUrl)

  utils.http.succeed(callback, {signupUrl: signupUrl});
}
