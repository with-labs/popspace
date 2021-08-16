const { PrismaClient } = require('@prisma/client');
const config = require('./config.js');

const configToDbUrl = (config) => {
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
};

const prisma = new PrismaClient({
  datasources: {
    db: {
      // connect the client to the database specified in the config for
      // the current environment
      url: configToDbUrl(config),
    },
  },
});

module.exports = prisma;
