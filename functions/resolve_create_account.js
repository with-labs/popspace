require("dotenv").config()

const headers = {
  'Content-Type': 'application/json'
};

const isValidOtp = async (email, otp) => {
  // TODO: check redis
  return true
}

const createAccount = async (email) => {
  // TODO: fetch account params from redis
}

module.exports.handler = (event, context, callback) => {
  const params = event.queryStringParameters

  const otp = params.otp
  const email = params.email

  callback(null, {
    statusCode: 200,
    headers,
    body: JSON.stringify({otp: otp, email: email, test: process.env.test || 1})
  })
}
