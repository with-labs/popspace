require("jest")
const tlib = require("../lib/_testlib")
const scenarios = require('./mercury_client_scenarios')


describe('mercury_client', () => {
  // We have some long-running tests
  jest.setTimeout(30000);

  test("allows a connection", async () => {
    await scenarios["connect_send_disconnect"]()
    expect(true)
  })

  test('broadcasts messages from one client to all other clients', async () => {
    const sentMessage = 'hello'
    const messagesReceived = await scenarios["1_sender_2_receivers"](sentMessage)
    messagesReceived.forEach((message) => {
      expect(message).toEqual(sentMessage)
    })
  })
})
