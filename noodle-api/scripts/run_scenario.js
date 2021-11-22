require("dotenv").config()
require("../src/globals.js")
shared.test = shared.requireTesting()
const path = require("path")

const runScenario = async () => {
  await lib.init()
  const scenarioPath = path.join(__dirname, "../tests")
  await shared.test.TestScenarioRunner.runScenario(scenarioPath)
  await lib.cleanup()
  process.exit(0)
}

runScenario()
