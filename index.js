require("dotenv").config()

global.lib = require("./src/lib/_lib")
const Mercury = require("./src/mercury")

const begin = async () => {
  await lib.init()
  new Mercury(process.env.EXPRESS_PORT, process.env.HEARTBEAT_TIMEOUT_MILLIS || 60000).start()
}

begin()
