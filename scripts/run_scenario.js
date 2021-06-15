require("dotenv").config()
require("../src/globals.js")
shared.test = shared.requireTesting()
const path = require("path")

const runScenario = async () => {
  await lib.init()
  const scenarioPath = path.join(__dirname, "../tests")
  const result = await shared.test.TestScenarioRunner.runScenario(scenarioPath)
  console.log(result)
  await lib.cleanup()
  console.log("----------- Done --------------")
  process.exit(0)
}

runScenario()
