import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Прямое подключение (не через пулер) — нужно для миграций Prisma.
    url: env("DIRECT_URL"),
  },
});
