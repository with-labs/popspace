require("dotenv").config()
const lib = require("../functions/lib/index.js")

const repl = require("repl");


const startConsole = async () => {
  await lib.init()
  replServer = repl.start({});
  for(key of Object.keys(global)) {
    replServer.context[key] = global[key];
  }
}

startConsole()
