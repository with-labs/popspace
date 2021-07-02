module.exports = {
  "meeting_url_create": lib.test.template.serverClient(async (server, client) => {
    const response = await client.post('/meeting_url', {
      template_name: "slack_room",
      template: {
        state: { display_name: "new room" },
        widgets: []
      }
    });
    return {
      response
    }
  }),
  "opengraph": lib.test.template.serverClient(async (server, client) => {
    const response = await client.post("/opengraph", {url: 'http://www.google.com'})
    return {
      response
    }
  }),
  "opengraph_fail": lib.test.template.serverClient(async (server, client) => {
    const response = await client.post("/opengraph", {url: 'not a url'})
    return {
      response
    }
  }),
}
