const HttpClient = {};

HttpClient.anyLoggedInOrCreate = async (host, certificate, port) => {
  const actor = await shared.db.prisma.actor.findFirst();
  if (actor) {
    return HttpClient.forActor(actor, host, certificate, port);
  }
  return HttpClient.create(host, certificate, port);
};

HttpClient.create = async (host, certificate, port) => {
  const actor = await shared.db.prisma.actor.create({
    data: {
      kind: 'user',
      displayName: shared.test.chance.name() + ' ' + shared.test.chance.last(),
    },
  });
  return HttpClient.forActor(actor, host, certificate, port);
};

HttpClient.forActor = async (actor, host, certificate, port) => {
  const SharedHttpClient = shared.net.HttpClient.default;
  const client = new SharedHttpClient(host, certificate, port);
  await client.forceLogIn(actor);
  return client;
};

module.exports = HttpClient;
