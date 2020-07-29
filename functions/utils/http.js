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

  fail: (callback, message) => {
    return callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({success: false, message: message})
    });
  },

  succeed: (callback, data) => {
    return callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify(Object.assign(data, {success: true}))
    });
  }
}

module.exports = http;
