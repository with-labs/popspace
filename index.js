require("dotenv").config()

require("./src/globals")
const Server = require("./src/server")
const cluster = require("cluster")

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
  if(cluster.isMaster) {
    log.app.info(`(master thread) ${process.env.NODE_ENV} Noodle API started`)
  } else {
    if(cluster.isWorker && cluster.worker) {
      log.app.info(`(worker ${cluster.worker.id}) ${process.env.NODE_ENV} Noodle API started`)
    } else {
      log.app.warn(`(unknown thread) ${process.env.NODE_ENV} Noodle API started`)
    }
  }

  const server = new Server(process.env.EXPRESS_PORT)

  /*
    This is handy if we want to debug a live process
    that we're connecting to from outside.
  */
  global._server = server

  await server.start()

  /*
    Let pm2 know the app is ready
    https://pm2.keymetrics.io/docs/usage/signals-clean-restart/
  */
  if (process.send) {
    process.send('ready')
  }
}

begin()
