require("dotenv").config()
const lib = require("../src/lib/_lib.js")

const repl = require("repl")

const startConsole = async () => {
  await lib.init()
  replServer = repl.start({})
  for(key of Object.keys(global)) {
    replServer.context[key] = global[key]
  }
  replServer.context.require = require
}

startConsole()
