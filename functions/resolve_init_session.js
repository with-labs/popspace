const utils = require("utils");
const env = utils.env.init(require("./env.json"))

const db = require("db");


const accountRedis = new db.redis.AccountsRedis();
let pg = null

const isValidOtp = (request, otp) => {
  return request.otp == otp
}

const isExpired = (request) => {
  if(!!request.resolvedAt) return true;
  const expireDuration = request.expireDuration
  if(!expireDuration) return false;
  const expiresAt = parseInt(request.requestedAt) + parseInt(expireDuration)
  console.log(expireDuration, expiresAt, Date.now(), expiresAt - Date.now())
  return !!request.resolvedAt || (expiresAt - Date.now() < 0)
}

const logIn = async (request) => {
  await accountRedis.resolveLogInRequest(request)
  const user = await pg.users.find({email: request.email})
  const token = await utils.session.beginSession(user[0].id, accountRedis);
  return token;
}

const sendRegistrationAttemptEmail = async (request) => {
  console.log("Email already registered. Sending email with OTP.");
}

module.exports.handler = async (event, context, callback) => {
  if(utils.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  pg = await db.pg.init();

  const otp = params.otp;
  const email = params.email;

  const request = await accountRedis.getLogInRequest(params.email);

  if(!request) {
    return utils.http.fail(callback, "No login request for this email")
  }

  if(isValidOtp(request, otp)) {
    if(isExpired(request)) {
      utils.http.fail(callback, "Your code has expired. Please log in again.");
    } else {
      try {
        const token = await logIn(request);
        utils.http.succeed(callback, {token: JSON.stringify(token)});
      } catch(e) {
        utils.http.fail(callback, e.message);
      }
    }
  } else {
    utils.http.fail(callback, "Invalid OTP/email");
  }

}
