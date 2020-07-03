const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const uuidv4 = require('uuid').v4;

const MAX_ALLOWED_SESSION_DURATION = 14400;

const ROOM_WHITELIST_PASSCODES = {
  dev: '92cd6c0cdd0b323ab88329e9f12cb17c',
  staging: '9a6db12a137c7f51c5dc7127aab6defc',
  prod: 'cdd021c453d076ecf6d2234d6851d4e1',
  jesse: 'a500fb1d401a0de1e10a238249e9620a',
  wyatt: '1b4764c939a00359a88c22c35809e640',
  brent: 'eb3ed78b2bb6a0ca2491df488f4cd632',
  lolo: 'itstime',
  chris: 'ccc6d607f1adbab4adb59efe047a2f4e',
  darren: 'fc8b7ba4645dedbd5a118e56525bc648',
  julia: '47ed9e60bbe845283bc2fe37aa55bf45',
  elle: '33167f62cc63e2f2dd08d97f2baaf052',
  catch: 'd16a501f0206ecdac5353c0a82c1434f',
  chrismessina: '3777307c2cd1dd16ad8e32380e4ea17e',
  christina: 'd4e22659e840d64035977a5ac673c780',
  walkingpancake: '24af93dd8a982ccd5f8cc7b990d25ae2',
  beastybois: 'DnD2020!',
  kerrybookclub: '2cdfbc912a2d5c2481717ab0378a35db',
  lagunagames: '96b45c9f05213a9d4a101e9793956843',
  picsofkai: 'Cornwall224',
  scapic: '2cddca35aefd840ecf5e67fc872f3f02',
  itsagooddeck: 'playfaster',
  mspennskindergarten: 'Classroom34',
  churchillbuildingcompany: '20CBCroom',
  auraframes: 'b25b0',
  chrisbecherer: 'a28cf',
  jonwinny: '31f4e',
  hankheyming: 'f2040',
  jmow: 'e1d12',
  virtualkitchen: 'c9df3',
  mdes: 'designorama',
  chezkerry: '2ac2f5',
  johnpalmer: 'f9e8e',
  leah: 'V!rtual338',
  moxon: '2f6e8',
  fanafan: 'itstime',
  charlesgivre: '698c7',
  seanlutjens: '34sltns',
  mindsense: '2011',
  louis: '4d3n3',
  viksit: '912d8',
  partytime: 'party',
  maddie: 'adcec',
  meetwith: 'meetwith2020',
  karenbourdon: 'karenannarbor',
  spark: 'Spark2020',
  coatue: 'coatue2020',
  kpcb: 'kpcb2020',
  uif: 'UIF2020',
  mayfield: 'mayfield2020',
  floodgate: 'floodgate2020',
  anywayfm: '660129',
  nanossegundo: '208864',
  gregmcmullen: '038007',
  catherio: '995644',
  windowledge: '488325',
  grammarlydesign: '308428',
  ufo: '965904',
  avhq: '645078',
  bsk: '943552',
  bochum: '879110',
  gettingstuffdone: '912935',
  basement: '644455',
  mvvc17red: 'gomvvc',
  scrumvc: 'scrum2020',
  creativelounge: '430266',
  mobelux: '852112',
  saamyverse: '669737',
  farmstead: '141547',
  cryptocastle: '830056',
  thelibrary: '932191',
  herskoland: '651023',
  astro: '497240',
  commoncode: '376255',
  danb: '323388',
  caro: '940666',
  theloop: '278578',
  vgs: '907324',
  ritomoni: '402509',
  collabbrain: '521860',
  woork: '312531',
  rupie: '856302',
  littlespoon: '145594',
  whoville: '870684',
  dalsden615: '490578',
  woot: '856799',
  room126: '195300',
  steve: '596286',
  youngscience: '942535',
  happyhour: '902276',
  decalab: '360128',
  sevenbridges: '522299',
  happyhours: '924140',
  rb: '138873',
  virvie: '551082',
  fridaydinnerparty: '709408',
  oatcity: '919168',
  jacksroom: '226561',
  beings: '631198',
  yamatomachi: '698984',
  magugz: '451220',
  bletchleypark: '514064',
  work: '636400',
  kabes: '487616',
  lhgraphiste: '394760',
  irina: '395678',
  ken: '111881',
  wongfam: 'wongfam2020',
  scrumvc: 'scrum2020',
  vorga: 'vorga2020',
  firstround: 'firstround2020',
  sequoia: 'sequoia2020',
  apronanalytics: 'apron2020',
  saad: 'saad2020',
  roguevc: 'roguevc2020',
  nabeel: 'nabeel2020',
  pomona: 'brunch',
  odf: 'OnDeckCommunity2020',
  stonna: 'stonna2020',
  advancit: 'advancit2020',
  afore: 'afore2020',
};

// When developing locally (npm run dev), don't enforce passcode
const DISABLE_LOCAL_DEV_AUTH = process.env.DISABLE_LOCAL_DEV_AUTH === 'true';

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
  console.log('1');
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
  console.log('2');
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
  console.log('3');
  // The passcode for each room_name must be correct if not running in local dev mode
  if (!DISABLE_LOCAL_DEV_AUTH && (!passcode || !passcode.length || ROOM_WHITELIST_PASSCODES[room_name] !== passcode)) {
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
  console.log('4');
  // A user_identity a.k.a. user's name must be supplied to join room
  if (!user_identity || !user_identity.length) {
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
  console.log('5');
  const userUuid4 = uuidv4();
  const token = new AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  });
  console.log('6');
  token.identity = `${user_identity}#!${userUuid4}`;
  const videoGrant = new VideoGrant({ room: room_name });
  token.addGrant(videoGrant);
  const body = JSON.stringify({token: token.toJwt()});
  console.log('7');
  callback(null, {
    statusCode: 200,
    headers,
    body
  });
};
