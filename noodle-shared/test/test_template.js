module.exports = {
  /* TODO: maybe rename to describeWithShared */
  describeWithLib: (name, handler) => {
    describe(name, () => {
      beforeAll(async () => {
        await shared.test.init();
        await shared.init();
      });
      afterAll(async () => {
        return await shared.cleanup();
      });
      return handler();
    });
  },
};
