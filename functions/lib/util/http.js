const headers = {
  'Content-Type': 'application/json'
};

const http = {
  failUnlessPost: (event, callback) => {
    if(event.httpMethod !== 'POST' || !event.body) {
      http.fail(callback, "Must provide POST body")
      return true;
    }
    return false;
  },

  fail: async (callback, message, data={}) => {
    // Note: currently testing a style of lambda context-reuse
    // that should not require resource cleanup after relaunch
    // https://www.jeremydaly.com/reuse-database-connections-aws-lambda/
    // https://stackoverflow.com/questions/41621776/why-does-aws-lambda-function-always-time-out
    // https://www.serverlesslife.com/AWS_Serverless_Common_Mistakes_Communication_with_Other_Systems.html
    // await lib.cleanup()
    data.message = data.message || "Unknown error"
    callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify(Object.assign(data, {message: message, success: false}))
    });
  },

  succeed: async (callback, data) => {
    // await lib.cleanup()
    return callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify(Object.assign(data, {success: true}))
    });
  },

  authFail: async (errorCode, callback) => {
    const errorDetails = { errorCode: errorCode }
    switch(errorCode) {
      case shared.error.code.INVALID_OTP:
        return await util.http.fail(callback, "Invalid one-time passcode.", errorDetails);
      case shared.error.code.EXPIRED_OTP:
        return await util.http.fail(callback, "Sorry, this link has expired.", errorDetails);
      case shared.error.code.RESOLVED_OTP:
        // We could be more elaborate and try to figure out if it's the current user
        // and whether they already have access to the OTP-protected resource
        return await util.http.fail(callback, "This code is no longer valid.", errorDetails);
      case shared.error.code.UNEXPECTER_ERROR:
        // TODO: ERROR_LOGGING
        return await util.http.fail(callback, "An unexpected error happened. Please try again.", errorDetails);
      default:
        return await util.http.fail(callback, "An unexpected error happened. Please try again.", errorDetails);
    }
  }

}

module.exports = http;
