require("dotenv").config()
require("./src/globals")
const Hermes = require("./src/hermes")

const getPort = () => {
  /*
    Allows running tests while a dev server is running locally
  */
  if (process.env.NODE_ENV == "test") {
    return process.env.TEST_HERMES_PORT || 8890
  } else {
    return process.env.HERMES_PORT || 8890
  }
}

const begin = async () => {
  process.on('SIGINT', async () => {
    /*
      This is for pm2: it sends a SIGINT before doing anything else,
      which is the opportunity to finish any in-flight requests,
      clean up database connections, etc.

      https://pm2.keymetrics.io/docs/usage/signals-clean-restart/
    */
    try {
      await lib.cleanup()
      await global._hermes.stop()
      process.exit(0)
    } catch {
      process.exit(1)
    }
  })

  log.app.info(`----- Starting ${process.env.NODE_ENV} ------`)
  await lib.init()
  log.system.info(`${process.env.NODE_ENV} Hermes started`)
  const hermes = new Hermes(getPort(), process.env.HEARTBEAT_TIMEOUT_MILLIS || 60000).start()
  /*
    This is handy if we want to debug a live process
    that we're connecting to from outside.
  */
  global._hermes = hermes
  /*
    Let pm2 know the app is ready
    https://pm2.keymetrics.io/docs/usage/signals-clean-restart/
  */
  if (process.send) {
    process.send('ready')
  }
}

begin()
