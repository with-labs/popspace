import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // @see https://github.com/prisma/prisma/issues/5533
  // @ts-ignore
  __internal: {
    useUds: true,
  },
});

console.log('Connected to database');

export default prisma;
