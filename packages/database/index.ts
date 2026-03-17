import { PrismaClient } from '@prisma/client';
import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) throw new Error('DATABASE_URL environment variable is not set');
const sql = neon(connectionString);
const adapter = new PrismaNeonHTTP(sql);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
export { PrismaClient };
