const HttpClient = {}

HttpClient.anyLoggedInOrCreate = async (host, certificate, port) => {
  let actor = await shared.db.pg.massive.actors.findOne({})
  return HttpClient.create(host, certificate, port)
}

HttpClient.create = async (host, certificate, port) => {
  const actor = await shared.test.factory.create("actor")
  return HttpClient.forActor(actor, host, certificate, port)
}

HttpClient.forActor = async (actor, host, certificate, port) => {
  const client = new shared.net.HttpClient(host, certificate, port)
  await client.logIn(actor)
  return client
}

module.exports = HttpClient
