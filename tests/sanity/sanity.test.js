global.shared = require('../../index.js');
shared.test = shared.requireTesting();

shared.test.TestTemplate.describeWithLib('basic_test', () => {
  test('Anything works at all', async () => {
    expect(true);
  });
});
