const tests = require("./lib/_tests")


describe('mercury_server', () => {

  it('allows clients to connect and send messages', () => {
    const ws = require('ws')
    const client = new ws('ws://localhost:3000');

    client.on('open', () => {
      client.send('Hello');
      client.close()
    });
  })

})
