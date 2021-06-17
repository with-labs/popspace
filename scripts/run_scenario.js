require("dotenv").config()
require("../src/globals.js")
shared.test = shared.requireTesting()
const path = require("path")
const util = require("util")

const runScenario = async () => {
  util.inspect.defaultOptions.depth = 20
  util.inspect.defaultOptions.colors = true
  util.inspect.defaultOptions.getters = true
  util.inspect.defaultOptions.compact = true

  await lib.init()
  const scenarioPath = path.join(__dirname, "../tests")
  try {
    const result = await shared.test.TestScenarioRunner.runScenario(scenarioPath)
    console.log(result)
  } catch(e) {
    console.error(e)
  } finally {
    await lib.cleanup()
  }
  console.log("----------- Done --------------")
  process.exit(0)

}

runScenario()
