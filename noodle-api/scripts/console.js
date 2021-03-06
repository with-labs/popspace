require("dotenv").config()
require("../src/globals.js")
console.log(`Starting console - ${process.env.NODE_ENV}`)

const repl = require("repl")
const util = require("util")

const startConsole = async () => {
  await lib.init()

  util.inspect.defaultOptions.depth = 20
  util.inspect.defaultOptions.colors = true
  util.inspect.defaultOptions.getters = true
  util.inspect.defaultOptions.compact = true

  const replServer = repl.start({
    writer: util.inspect,
    prompt: "=> "
  })
  for(key of Object.keys(global)) {
    replServer.context[key] = global[key]
  }
  replServer.setupHistory(`./local/repl_history_${process.env.NODE_ENV}`, () => {})
  replServer.on('exit', () => {
    console.log('Goodbye!');
    process.exit();
  });
}

startConsole()
