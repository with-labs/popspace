require("dotenv").config()
console.log(`Starting console - ${process.env.NODE_ENV}`)
global.lib = require("../src/lib/_lib.js")
global.tlib = require("../test/lib/_testlib.js")

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
