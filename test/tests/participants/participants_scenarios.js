global.tlib = require("../../lib/_testlib")

module.exports = {
  "one_participant": tlib.TestTemplate.testServerClients(1, async (clients) => {
    const response = await clients[0].broadcast("hello")
    return {
      serverResponse: response
    }
  }),
}
