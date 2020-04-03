const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const MAX_ALLOWED_SESSION_DURATION = 14400;

const ROOM_WHITELIST_PASSCODES = {
  dev: '92cd6c0cdd0b323ab88329e9f12cb17c',
  staging: '9a6db12a137c7f51c5dc7127aab6defc',
  prod: 'cdd021c453d076ecf6d2234d6851d4e1',
  jesse: 'a500fb1d401a0de1e10a238249e9620a',
  wyatt: '1b4764c939a00359a88c22c35809e640',
  brent: 'eb3ed78b2bb6a0ca2491df488f4cd632',
  lolo: 'cb685cf0b9c635cf2e49cc0ab96bb8c0',
  chris: 'ccc6d607f1adbab4adb59efe047a2f4e',
  darren: 'fc8b7ba4645dedbd5a118e56525bc648',
  julia: '47ed9e60bbe845283bc2fe37aa55bf45',
  elle: '33167f62cc63e2f2dd08d97f2baaf052',
};

const headers = {
  'Content-Type': 'application/json'
};

module.exports.handler = (event, context, callback) => {

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
  const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;

  // We only care about POSTs with body data
  if(event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode: 200,
      headers,
      body: ''
    });
  }

  // Parese JSON body of request and handle errors if malformed
  try {
    let requestBody = JSON.parse(event.body);
    var { user_identity, room_name, passcode } = requestBody;
  } catch {
    const body = JSON.stringify({
      error: {
        message: 'incorrect body data',
        explanation: 'The JSON body submitted is incorrect.',
      }
    });
    callback(null, {
      statusCode: 400,
      headers,
      body
    });
    return;
  }

  // We only allow a room_name that is whitelisted
  if (!room_name || !room_name.length || !ROOM_WHITELIST_PASSCODES[room_name]) {
    const body = JSON.stringify({
      error: {
        message: 'room_name incorrect',
        explanation: 'The room_name submitted is incorrect.',
      }
    });
    callback(null, {
      statusCode: 401,
      headers,
      body
    });
    return;
  }

  // The passcode for each room_name must be correct
  if (!passcode || !passcode.length || ROOM_WHITELIST_PASSCODES[room_name] !== passcode) {
    const body = JSON.stringify({
      error: {
        message: 'passcode incorrect',
        explanation: 'The passcode used to access this room_name is incorrect.',
      }
    });
    callback(null, {
      statusCode: 401,
      headers,
      body
    });
    return;
  }

  // A user_identity a.k.a. user's name must be supplied to join room
  if (!user_identity) {
    const body = JSON.stringify({
      error: {
        message: 'missing user_identity',
        explanation: 'The user_identity parameter is missing.',
      }
    });
    callback(null, {
      statusCode: 400,
      headers,
      body
    });
    return;
  }

  const token = new AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  });
  token.identity = user_identity;
  const videoGrant = new VideoGrant({ room: room_name });
  token.addGrant(videoGrant);
  const body = JSON.stringify({token: token.toJwt()});
  callback(null, {
    statusCode: 200,
    headers,
    body
  });
};
