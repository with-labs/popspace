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

  test('communication between 2 clients', async () => {
    const messages1 = ["hello", "1", "hi", "3"]
    const messages2 = ["goodbye", "2", "bye", "4"]
    const expectedSequence =[
      messages1[0], messages2[0],
      messages1[1], messages2[1],
      messages1[2], messages2[2],
      messages1[3], messages2[3],
    ]
    // Send copies of the arrays since we want to check the results against them
    const exchangeResult = await scenarios["2_peers_back_and_forth"]([...messages1], [...messages2])
    expect(exchangeResult.received1).toEqual(messages2)
    expect(exchangeResult.received2).toEqual(messages1)
    expect(exchangeResult.sequence).toEqual(expectedSequence)
  })
})
