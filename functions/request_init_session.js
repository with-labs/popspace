require("dotenv").config()
const cryptoRandomString = require('crypto-random-string');
const db = require("db");
const utils = require("utils");

/*
Log in flow

1. Check whether email is registered
2. Generate URL-safe OTP
3. Store login request in redis as {email: otp}
4. Send email with OTP link
5. If OTP link is opened, an resolve_init_session endpoint is called with the email+OTP parsed out of the link
6. Create/store session in redis/localStorage

*/

const accountRedis = new db.redis.AccountsRedis();

const accountExists = async (email) => {
  const pg = await db.pg.init()
  const user = await pg.users.find({email: email})
  return user.length > 0
}

const newLogInRequest = async (email)  => {
  const otp = cryptoRandomString({length: 64, type: 'url-safe'})
  const protocol = process.env.NODE_ENV == "dev" ? "http" : "https"
  const logInUrl = `${protocol}://${process.env.APP_HOST}/login?otp=${otp}&email=${email}`
  await accountRedis.writeLogInRequest(email, otp)
  return logInUrl
}

const sendOtpEmail = async (email, logInUrl) => {
  // TODO:  send email
  console.log(`Sending ${logInUrl} to email: ${email}`)
}

module.exports.handler = async (event, context, callback) => {
  // We only care about POSTs with body data
  if(utils.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)

  const haveAccount = await accountExists(params.email)

  if(!haveAccount) {
    return utils.http.fail(callback, "Unknown email", {invalidEmail: true})
  }

  const logInUrl = await newLogInRequest(params.email)
  await sendOtpEmail(params.email, logInUrl)

  utils.http.succeed(callback, {logInUrl: logInUrl});
}
