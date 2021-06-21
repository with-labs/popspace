require("dotenv").config()
require("./src/globals")
const Hermes = require("./src/hermes")

const getPort = () => {
  if(process.env.NODE_ENV == "test") {
    return process.env.TEST_PORT
  } else {
    return process.env.EXPRESS_PORT
  }
}

const begin = async () => {
  log.app.info(`----- Starting ${process.env.NODE_ENV} ------`)
  await lib.init()
  log.system.info(`${process.env.NODE_ENV} Hermes started`)
  const hermes = new Hermes(getPort(), process.env.HEARTBEAT_TIMEOUT_MILLIS || 60000).start()
  global.hermes = hermes
}

begin()
