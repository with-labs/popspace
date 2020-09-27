const pg = require("./pg/pg")
const otp = require("./otp")

const Accounts = require("./accounts")
const ErrorCodes = require("./error_codes")
const Rooms = require("./rooms")
const Profile = require("./profile")

const init = async () => {
  return await pg.init()
}

const cleanup = async () => {
  return await pg.tearDown()
}

module.exports = {
  pg: pg,
  otp: otp,
  Accounts: Accounts,
  ErrorCodes: ErrorCodes,
  Rooms: Rooms,
  Profile: Profile,

  init: init,
  cleanup: cleanup
}
