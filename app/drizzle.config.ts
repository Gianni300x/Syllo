import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js lee `.env.local` solo; drizzle-kit (CLI) necesita cargarlo explícito.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./app/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
