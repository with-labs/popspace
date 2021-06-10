shared.test.factory.define("user", "users", (params) => {
  return {
    id: shared.test.factory.sequence("users.id", (n) => n),
    email: shared.test.chance.email(),
    first_name: shared.test.chance.name(),
    last_name: shared.test.chance.last(),
    display_name: shared.test.chance.name() + " " + shared.test.chance.last(),
    verified_at: params.verified_at
  }
})
