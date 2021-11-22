module.exports = {
  "stubbing_users": lib.test.template.serverClient(async (server, client) => {
    const response = await client.post("/stub_user", {})
    return {
      response
    }
  })
}
