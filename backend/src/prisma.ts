import { PrismaClient } from '@prisma/client';

// Podle dokumentace Prisma v7 vyžaduje v monorepu inicializaci s prázdným objektem,
// aby se správně navázala na vygenerovaný engine v node_modules
export const prisma = new PrismaClient({} as any);