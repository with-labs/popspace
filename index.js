require("dotenv").config()

require("./src/globals")
const Server = require("./src/server")

const begin = async () => {
  await lib.init()
  log.app.info(`${process.env.NODE_ENV} Noodle API started`)
  const server = new Server(process.env.EXPRESS_PORT).start()
  global._server = server
}

begin()
