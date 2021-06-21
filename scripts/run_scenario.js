require("dotenv").config()
require("../src/globals.js")
shared.test = shared.requireTesting()
const path = require("path")


const runScenario = async () => {
  await lib.init()
  const scenarioPath = path.join(__dirname, "../tests")
  try {
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~RUNING SCENARIO")
    const result = await shared.test.TestScenarioRunner.runScenario(scenarioPath)
    console.log("F~~~~~~~~~~~~~~~~~~~~~~~INISHED RUNNING SCENARIO")
  } catch(e) {
    console.error(e)
  } finally {
    await lib.cleanup()
  }

  process.exit(0)

}

runScenario()
