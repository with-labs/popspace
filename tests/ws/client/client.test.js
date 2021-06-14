require("../../../test/_test.js")
const scenarios = require('./client_scenarios')

shared.test.TestTemplate.describeWithLib('hermes_client', () => {
  // We have some long-running tests
  jest.setTimeout(30000);

  test("allows a connection", async () => {
    await scenarios["connect_send_disconnect"]()
    expect(true)
  })

  test("disconnects on heartbeat timeout", async () => {
    const result = await scenarios["heartbeat_timeout_disconnect"]()
    expect(result.clientsAfterTimeout).toEqual(result.clientsBeforeTimeout - 1)
    expect(result.readyBeforeTimeout).toEqual(true)
    expect(result.readyAfterTimeout).toEqual(false)
  })

  test("other clients find out about a dropped client", async () => {
    const result = await scenarios["heartbeat_timeout_event_propagate"]()
    expect(result.leaveEvent.kind).toEqual("participantLeft")
    expect(result.clientsAfterTimeout).toEqual(result.clientsBeforeTimeout - 1)
    expect(result.readyBeforeTimeout).toEqual(true)
    expect(result.readyAfterTimeout).toEqual(false)
  })

  test('broadcasts messages from one client to all other clients', async () => {
    const result = await scenarios["1_sender_2_receivers"]()
    result.messagesReceived.forEach((message) => {
      expect(message).toEqual(result.sentMessage)
    })
    expect(result.messagesReceived.length).toEqual(2)
  })

  test('communication between 2 clients', async () => {
    // Send copies of the arrays since we want to check the results against them
    const result = await scenarios["2_peers_back_and_forth"]()
    const messages1 = result.messagesSent1
    const messages2 = result.messagesSent2
    const expectedSequence =[
      messages1[0], messages2[0],
      messages1[1], messages2[1],
      messages1[2], messages2[2],
      messages1[3], messages2[3],
    ]
    expect(result.messagesReceived1).toEqual(messages2)
    expect(result.messagesReceived2).toEqual(messages1)
    expect(result.sequence).toEqual(expectedSequence)
  })
})
