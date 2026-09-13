import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

// Кэшируем клиент на globalThis всегда, а не только в dev: в проде на
// Vercel один и тот же серверless-контейнер обслуживает несколько
// запросов подряд ("тёплый" вызов), и без кэша каждый запрос заново
// открывал TCP/TLS-соединение с базой вместо переиспользования пула —
// именно это было главной причиной медленной загрузки экранов.
export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });
globalForPrisma.prisma = db;
