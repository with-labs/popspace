const pg = require("./pg/pg")
const dynamo = require("./dynamodb/dynamo.js")
const otp = require("./otp")

const Accounts = require("./accounts")
const ErrorCodes = require("./error_codes")
const Rooms = require("./rooms")
const Profile = require("./profile")
const Magic = require("./magic")

const init = async () => {
  await pg.init()
  await dynamo.init()
  db.rooms = new Rooms()
  db.accounts = new Accounts()
  db.magic = new Magic()
}

const cleanup = async () => {
  await pg.tearDown()
  await db.dynamo.cleanup()
}

const db = {
  pg: pg,
  dynamo: dynamo,
  otp: otp,
  Accounts: Accounts,
  ErrorCodes: ErrorCodes,
  Rooms: Rooms,
  Profile: Profile,
  init: init,
  cleanup: cleanup
}

module.exports = db
