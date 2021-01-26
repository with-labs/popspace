const dynamo = require("./dynamodb/dynamo.js")

const Rooms = require("./rooms")
const Profile = require("./profile")
const Magic = require("./magic")

const init = async () => {
  await dynamo.init()
  db.rooms = new Rooms()
  db.magic = new Magic()
}

const cleanup = async () => {
  await db.dynamo.cleanup()
}

const db = {
  dynamo: dynamo,
  Rooms: Rooms,
  Profile: Profile,
  init: init,
  cleanup: cleanup
}

module.exports = db
