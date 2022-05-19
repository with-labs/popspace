import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

console.log('Connected to database');

export default prisma;
