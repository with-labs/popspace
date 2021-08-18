import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    __internal: {
        useUds: boolean;
    };
    datasources: {
        db: {
            url: string;
        };
    };
}, never, false>;
export default prisma;
