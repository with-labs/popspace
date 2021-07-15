require("dotenv").config()

require("./src/globals")
const Server = require("./src/server")

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
      await global._server.stop()
      process.exit(0)
    } catch {
      process.exit(1)
    }
  })

  await lib.init()
  log.app.info(`${process.env.NODE_ENV} Noodle API started`)
  const server = new Server(process.env.EXPRESS_PORT)

  /*
    This is handy if we want to debug a live process
    that we're connecting to from outside.
  */
  global._server = server

  await server.start()

  /*
    Let pm2 know the app is ready
  */
  process.send('ready')
}

begin()
