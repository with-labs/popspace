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

  async verifySessionAndGetUser(event, callback, accounts) {
    // TODO: transition to a middleware style,
    // where the params are only parsed once
    // Get rid of passing in accounts; there should be some global way
    // the db is initialized
    const params = JSON.parse(event.body)
    if(!params.token) {
      return lib.util.http.fail(callback, "Must be logged in")
    }
    const session = await accounts.sessionFromToken(params.token)
    if(!session) {
      return lib.util.http.fail(callback, "Authentication failed")
    }
    const userId = parseInt(session.user_id)
    const user = await accounts.userById(userId)
    if(!user) {
      return lib.util.http.fail(callback, "Authentication failed")
    }
    return user
  }

}

module.exports = http;
