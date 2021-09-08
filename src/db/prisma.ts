import { PrismaClient } from '@prisma/client';

import config from './config';

const configToDbUrl = (config) => {
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
};

const prisma = new PrismaClient({
  // @see https://github.com/prisma/prisma/issues/5533
  __internal: {
    // @ts-ignore
    useUds: true,
  },
  datasources: {
    db: {
      // connect the client to the database specified in the config for
      // the current environment
      url: configToDbUrl(config),
    },
  },
});

console.log('Connected to database', config.host, config.database);

export default prisma;
