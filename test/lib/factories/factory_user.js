factory.define("user", "users", (params) => {
  return {
    id: factory.sequence('user.id', (n) => n),
    email: chance.email(),
    first_name: chance.name(),
    last_name: chance.last(),
    display_name: chance.name() + " " + chance.last()
  };
});
