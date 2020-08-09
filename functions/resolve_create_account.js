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
  return !!request.resolvedAt || (expiresAt - Date.now() < 0)
}

const alreadyRegistered = (request) => {
  return !!request.resolvedAt;
}

const createAccount = async (request) => {
  await accountRedis.resolveAccountCreateRequest(request);
  const user = await pg.users.insert({
    first_name: request.firstName,
    last_name: request.lastName,
    display_name: `${request.firstName} ${request.lastName}`,
    email: request.email
  })
  const token = await utils.session.beginSession(user.id, accountRedis);
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

  const request = await accountRedis.getAccountCreateRequest(params.email);

  if(!request) {
    return utils.http.fail(callback, "Unknown email")
  }

  if(alreadyRegistered(request)) {
    await sendRegistrationAttemptEmail(request);
    return utils.http.fail(callback, "An account with that email already exists.");
  }

  if(isValidOtp(request, otp)) {
    if(isExpired(request)) {
      utils.http.fail(callback, "Your code has expired. Please sign up again.");
    } else {
      try {
        const token = await createAccount(request);
        utils.http.succeed(callback, {token: JSON.stringify(token)});
      } catch(e) {
        utils.http.fail(callback, e.message);
      }
    }
  } else {
    utils.http.fail(callback, "Invalid OTP");
  }

}
