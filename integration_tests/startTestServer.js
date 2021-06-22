require("dotenv").config()
global.blib = require("../app/lib/_lib")
global.shared = blib.shared
global.log = blib.log
const Server = require("../app/server")

const begin = async () => {
  await blib.init()
  const server = new Server(process.env.EXPRESS_PORT, false, true)
  server.start();
  console.log(`(${process.env.NODE_ENV}) Server running on port ${process.env.EXPRESS_PORT}`)

  return () => server.stop();
}

module.exports = begin;
