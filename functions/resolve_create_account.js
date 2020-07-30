require("dotenv").config();
const db = require("db");
const utils = require("utils");

const headers = {
  'Content-Type': 'application/json'
};

const accountRedis = new db.redis.AccountsRedis();

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
  const pg = await db.pg.init()
  await pg.users.create({
    first_name: request.first_name,
    last_name: request.last_name,
    display_name: `${request.first_name} ${request.last_name}`,
    email: request.email
  })
  await accountRedis.resolveAccountCreateRequest(request);
}

const sendRegistrationAttemptEmail = async (request) => {
  console.log("Email already registered. Sending email with OTP.");
}

module.exports.handler = async (event, context, callback) => {
  const params = event.queryStringParameters;

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
      await createAccount(request);
      utils.http.succeed(callback, {otp: otp, email: email});
    }
  } else {
    utils.http.fail(callback, "Invalid OTP/email");
  }

}
