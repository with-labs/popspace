shared.test.factory.define("actor", "actors", (params) => {
  return {
    id: shared.test.factory.sequence("actor.id", (n) => n),
    kind: params.kind || "user",
    display_name: shared.test.chance.name() + " " + shared.test.chance.last(),
    avatar_name: params.avatar_name,
    verified_at: params.verified_at,
    admin: params.admin,
    deleted_at: params.deleted_at
  }
})
