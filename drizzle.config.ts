import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "mssql" as any,
  dbCredentials: {
    url: `mssql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_SERVER}:1433/${process.env.DB_NAME}?trustServerCertificate=true`
  },
  verbose: true,
  strict: true,
});
