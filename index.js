require("dotenv").config()

global.lib = require("./src/lib/_lib")
const Mercury = require("./src/mercury")

const begin = async () => {
  await lib.init()
  new Mercury(process.env.EXPRESS_PORT).start()
}

begin()
