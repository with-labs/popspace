module.exports = {
  /*
    We don't necessarily want to be pulling in the test framework
    in all contexts.

    Starting off this way; it should be quite easy to migrate to a different style -
    since it involves an npm version bump. Downstream repos can upgrade as they
    upgrade the version.
  */
  test: require("./test/_test"),
  tool: require("./tool/_tool")
}
