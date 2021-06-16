module.exports = {
  "opengraph": lib.test.template.serverClient(async (server, client) => {
    const response = await client.post("/opengraph", {url: 'http://www.google.com'})
    return {
      response
    }
  })
}
