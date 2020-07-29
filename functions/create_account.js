const headers = {
  'Content-Type': 'application/json'
};

module.exports.handler = (event, context, callback) => {
  // We only care about POSTs with body data
  if(event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({success: false, message: "Must provide POST body"})
    });
  }

  callback(null, {
    statusCode: 200,
    headers,
    body: JSON.stringify({success: true})
  })
}
