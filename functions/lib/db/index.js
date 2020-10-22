const pg = require("./pg/pg")
const otp = require("./otp")

const Accounts = require("./accounts")
const ErrorCodes = require("./error_codes")
const Rooms = require("./rooms")
const Profile = require("./profile")
const Magic = require("./magic")

const init = async () => {
  const postgres = await pg.init()
  db.rooms = new Rooms()
  db.accounts = new Accounts()
  db.magic = new Magic()
  return postgres
}

const cleanup = async () => {
  return await pg.tearDown()
}

const db = {
  pg: pg,
  otp: otp,
  Accounts: Accounts,
  ErrorCodes: ErrorCodes,
  Rooms: Rooms,
  Profile: Profile,
  init: init,
  cleanup: cleanup
}

module.exports = db
