require("dotenv").config();
const db = require("db");
const utils = require("utils");

const headers = {
  'Content-Type': 'application/json'
};

const accountRedis = new db.redis.AccountsRedis();
let pg = null

const initPg = async () => {
  pg = await db.pg.init();
}

const isValidOtp = (request) => {
  if(!request) return false;
  return true;
}

const isExpired = (request) => {
  return parseInt(request.expireTimestamp) - Date.now() < 0
}

const alreadyRegistered = (request) => {
  return !!request.resolvedAt;
}

const createAccount = async (request) => {
  const user = await pg.users.insert({
    first_name: request.firstName,
    last_name: request.lastName,
    display_name: `${request.firstName} ${request.lastName}`,
    email: request.email
  })
  // await accountRedis.resolveAccountCreateRequest(request);
  const token = await utils.session.beginSession(user.id, accountRedis);
  return token;
}

const sendRegistrationAttemptEmail = async (request) => {
  console.log("Email already registered. Sending email with OTP.");
}

module.exports.handler = async (event, context, callback) => {
  if(utils.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  await initPg()

  const otp = params.otp;
  const email = params.email;

  const request = await accountRedis.getAccountCreateRequest(params.email);

  if(!request) {
    return utils.http.fail(callback, "Unknown email")
  }

  if(alreadyRegistered(request)) {
    await sendRegistrationAttemptEmail(request);
    return utils.http.fail(callback, "An account with that email already exists.");
  }

  if(isValidOtp(request)) {
    if(isExpired(request)) {
      utils.http.fail(callback, "Your code has expired. Please sign up again.");
    } else {
      const token = await createAccount(request);
      utils.http.succeed(callback, {success: true, token: JSON.stringify(token)});
    }
  } else {
    utils.http.fail(callback, "Invalid OTP/email");
  }

}
