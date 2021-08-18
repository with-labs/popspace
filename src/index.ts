import api from './api/_api';
import db from './db/_index';
import error from './error/_error';
import lib from './lib/_index';
import models from './models/_models';
import net from './net/_net';

const shared = {
  db,
  lib,
  error,
  models,
  api,
  net,
  init: async () => {
    await db.pg.init();
  },
  cleanup: async () => {
    await db.pg.tearDown();
  },
  requireTesting: () => {
    if (process.env.NODE_ENV != 'test') {
      throw 'NODE_ENV must be test';
    }
    (shared as any).test = require('../test/_test');
    /*
      can be more explicit/verbose:
      shared.test = shared.initTesting()
    */
    return (shared as any).test;
  },
  initDynamo: async () => {
    /*
      Avoiding puting this into the general init -
      at least until I set up readonly credentials,
      so auxiliary microservices can safely init
    */
    await db.dynamo.init();
    /*
      No cleanup necessary in general,
      it's just individual API calls that have credentials
    */
  },
};

export default shared;
