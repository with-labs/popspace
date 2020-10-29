const headers = {
  'Content-Type': 'application/json'
};

const ERRORS = {
  rooms: {
    // TODO: migrate all error codes to strings
    JOIN_FAIL_NO_SUCH_USER: 1,
    JOIN_ALREADY_MEMBER: 2,
    UNKNOWN_ROOM: 'UNKNOWN_ROOM',
    UNAUTHORIZED: 'UNAUTHORIZED',
    UNAUTHORIZED_ROOM_ACCESS: 'UNAUTHORIZED_ROOM_ACCESS',
    INCORRECT_ROOM_PASSCODE: 'INCORRECT_ROOM_PASSCODE',
    INVALID_USER_IDENTITY: 'INVALID_USER_IDENTITY',
  }
}

const http = {
  ERRORS: ERRORS,

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

}

module.exports = http;
