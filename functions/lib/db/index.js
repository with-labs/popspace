const pg = require("./pg/pg")
const Accounts = require("./accounts")
const Otp = require("./otp")
const ErrorCodes = require("./error_codes")
const Rooms = require("./rooms")
const Profile = require("./profile")

module.exports = {
  pg: pg,
  Otp: Otp,
  Accounts: Accounts,
  ErrorCodes: ErrorCodes,
  Rooms: Rooms,
  Profile: Profile
}
