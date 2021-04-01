require("dotenv").config()

require("./src/globals")
const Mercury = require("./src/mercury")

const begin = async () => {
  await lib.init()
  log.system.info(`${process.env.NODE_ENV} Mercury started`)
  const mercury = new Mercury(process.env.EXPRESS_PORT, process.env.HEARTBEAT_TIMEOUT_MILLIS || 60000).start()
  global.mercury = mercury
}

begin()
