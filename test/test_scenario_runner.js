const runScenario = (testPath="../tests") => {
  require("dotenv").config()
  const util = require("util")
  global.shared = require("../index.js")

  const commander = require("commander")

  commander
    .version("1.0.0")
    .option("-c, --component <component_name>", "Component to test")
    .option("-t, --test <test_name>", "Test suite name")
    .option("-s, --scenario <scenario_name>", "Scenario name")
    .parse(process.argv)

  const runOptions = commander.opts();

  const doRun = async () => {
    let path = testPath
    
    if(runOptions.component) {
      path += `/${runOptions.component}`
    }

    console.log("Running", runOptions.test, runOptions.scenario)

    const testSuite = require(`${path}/${runOptions.test}/${runOptions.test}_scenarios.js`)
    await shared.test.init()
    await shared.init()
    console.log("Running", runOptions.test, runOptions.scenario)
    const result = await testSuite[runOptions.scenario]()
    console.log("Test result", util.inspect(result, {depth: 20, colors: true}))
    await shared.cleanup()
    return result
  }

  return doRun()
}


module.exports = {
  runScenario
}
