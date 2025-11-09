import { PrismaClient } from '@/generated/prisma';

// Evita que se creen múltiples instancias de PrismaClient en desarrollo
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
