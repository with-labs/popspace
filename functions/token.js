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

/**
 * The various secret constants to access the Twilio API are stored in sereral
 * places. The file /.netlify.toml holds the TWILIO_API_KEYS_ENV values. They
 * are set based on the build context when Netlify makes a build.
 * (https://docs.netlify.com/site-deploys/overview/#deploy-contexts)
 *
 * The TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, and TWILIO_API_KEY_SECRET
 * are stored inside the Netlify admin panel. They are injected during build.
 * Also, during local development, they are pulled down from the servers. So,
 * your local app (netlify dev), has access to the same API keys as when a
 * build is made on the Netlify servers.
 */

// the Twilio Account SID is universal for all services
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
// This value comes from netlify.toml, and is a based on Netlify build context
// It is either "production" or "development"
const TWILIO_API_KEYS_ENV = process.env.TWILIO_API_KEYS_ENV;
// These API keys were generated inside the Twilio admin panel, then are stored
// inside the Netlify admin panel.
const TWILIO_API_KEYS = {
  development: {
    TWILIO_API_KEY_SID:    process.env.TWILIO_API_KEY_SID_DEV,
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET_DEV,
  },
  production: {
    TWILIO_API_KEY_SID:    process.env.TWILIO_API_KEY_SID_PROD,
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET_PROD,
  }
}

// If you have access to the Netlify environment context, use it to determien
// which API keys to use. Otherwise, fallback to the 'development' API keys.
const TWILIO_API_KEY_SID =    TWILIO_API_KEYS[TWILIO_API_KEYS_ENV] ? TWILIO_API_KEYS[TWILIO_API_KEYS_ENV].TWILIO_API_KEY_SID :    TWILIO_API_KEYS['development'].TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = TWILIO_API_KEYS[TWILIO_API_KEYS_ENV] ? TWILIO_API_KEYS[TWILIO_API_KEYS_ENV].TWILIO_API_KEY_SECRET : TWILIO_API_KEYS['development'].TWILIO_API_KEY_SECRET;

module.exports.handler = (event, context, callback) => {

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
