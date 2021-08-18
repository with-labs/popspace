import chalk from 'chalk';
import commander from 'commander';
import util from 'util';

const runScenario = (testPath = '../tests') => {
  require('dotenv').config();
  global.shared = require('../index.js');
  util.inspect.defaultOptions.depth = 20;
  util.inspect.defaultOptions.colors = true;
  util.inspect.defaultOptions.getters = true;
  util.inspect.defaultOptions.compact = true;

  commander
    .version('1.0.0')
    .option('-c, --component <component_name>', 'Component to test')
    .option('-t, --test <test_name>', 'Test suite name')
    .option('-s, --scenario <scenario_name>', 'Scenario name')
    .parse(process.argv);

  const runOptions = commander.opts();

  const doRun = async () => {
    let path = testPath;

    if (runOptions.component) {
      path += `/${runOptions.component}`;
    }

    console.log(
      '\n-------------- ' +
        chalk.red.bold.underline.bgBlack(
          ` ${runOptions.test}.${runOptions.scenario} `,
        ) +
        ' --------------\n',
    );
    const testSuite = require(`${path}/${runOptions.test}/${runOptions.test}_scenarios.js`);
    await shared.test.init();
    await shared.init();
    await shared.db.pg.silenceLogs();
    const result = await testSuite[runOptions.scenario]();

    console.log(chalk.bgBlack.white.bold('\n===== Test result ======\n\n'));
    console.log(util.inspect(result, { depth: 20, colors: true }));
    console.log(chalk.bgBlack.white.bold('\n\n========================\n'));

    await shared.cleanup();
    console.log('\n------------------------- Done -----------------------\n');
    return result;
  };

  return doRun();
};

export default {
  runScenario,
};
