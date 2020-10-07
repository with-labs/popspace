const lib = require("lib")
lib.util.env.init(require("./env.json"))

const AccessToken = require('twilio').jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant
const uuidv4 = require('uuid').v4

// 240 hours
// https://www.twilio.com/docs/chat/create-tokens
const MAX_ALLOWED_SESSION_SECONDS = 14400

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
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
// This value comes from netlify.toml, and is a based on Netlify build context
// It is either "production" or "development"
const TWILIO_API_KEYS_ENV = process.env.TWILIO_API_KEYS_ENV
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

const canEnterRoom = async (user, room) => {
  if(user.id == room.owner_id) return true;
  return await lib.db.rooms.isMember(user.id, room.id)
}

module.exports.handler = async (event, context, callback) => {

  if(util.http.failUnlessPost(event, callback)) return;
  await lib.init()

  const body = JSON.parse(event.body)
  const roomName = body.roomName
  const room = await lib.db.rooms.roomByName(roomName)

  if(!room) {
    return await lib.util.http.fail(
      callback,
      `Room not found: ${roomName}`,
      { errorCode: util.http.ERRORS.rooms.UNKNOWN_ROOM }
    )
  }

  const user = await lib.util.http.verifySessionAndGetUser(event, callback, lib.db.accounts)
  if(!user) {
    return await lib.util.http.fail(
      callback,
      `Must be logged in to join room`,
      { errorCode: util.http.ERRORS.user.UNAUTHORIZED }
    )
  }

  const canEnter = await canEnterRoom(user, room)
  if(!canEnter) {
    return await lib.util.http.fail(
      callback,
      `Unauthorized access`,
      { errorCode: util.http.ERRORS.room.UNAUTHORIZED_ROOM_ACCESSS }
    )
  }

  const userUuid4 = uuidv4();
  const token = new AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
    ttl: MAX_ALLOWED_SESSION_SECONDS,
  })

  token.identity = `${user.display_name}#!${userUuid4}`;
  const videoGrant = new VideoGrant({ room: room.id });
  token.addGrant(videoGrant);

  return await util.http.succeed(callback, {token: token.toJwt()})
}
