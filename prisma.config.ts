import path from "node:path";
import { defineConfig } from "prisma/config";

// Load .env for CLI commands (prisma generate, db push, etc.)
import "dotenv/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
