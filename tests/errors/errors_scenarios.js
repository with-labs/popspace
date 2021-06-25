module.exports = {
  "errors_written": lib.test.template.serverClients(0, async (server) => {
    const client = await lib.test.template.loggedOutClient()
    const response = await client.post("/create_meeting", {})
    return {
      response
    }
  }),
}

