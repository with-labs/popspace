require("dotenv").config()
require("../src/globals.js")
const path = require("path")

const runScenario = async () => {
  await lib.init()
  const scenarioPath = path.join(__dirname, "../tests")
  await shared.tool.TestScenarioRunner.runScenario(scenarioPath)
  await lib.cleanup()
  process.exit(0)
}

runScenario()
