require("dotenv").config()

require("./src/globals")
const Hermes = require("./src/hermes")

const begin = async () => {
  await lib.init()
  log.system.info(`${process.env.NODE_ENV} Hermes started`)
  const hermes = new Hermes(process.env.EXPRESS_PORT, process.env.HEARTBEAT_TIMEOUT_MILLIS || 60000).start()
  global.hermes = hermes
}

begin()
