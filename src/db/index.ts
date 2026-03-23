import * as sql from "mssql";
import { drizzle } from "drizzle-orm/node-mssql";
import * as schema from "./schema";

const dbUser = process.env.DB_USER || "sa";
const dbPassword = process.env.DB_PASSWORD || "password";
const dbServer = process.env.DB_SERVER || "192.168.80.120"; // user specified IP
const dbName = process.env.DB_NAME || "your_database_name";

// Configuration for MSSQL
const sqlConfig = {
  user: dbUser,
  password: dbPassword,
  database: dbName,
  server: dbServer,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // For local networks usually false, true for Azure
    trustServerCertificate: true // Trust local self-signed certificates
  }
};

declare global {
  var _sqlPoolPromise: Promise<sql.ConnectionPool> | undefined;
}

// Global pool connection
let poolPromise: Promise<sql.ConnectionPool>;

if (!globalThis._sqlPoolPromise) {
  globalThis._sqlPoolPromise = sql.connect(sqlConfig);
}
poolPromise = globalThis._sqlPoolPromise;

export const getConnection = async () => {
  const pool = await poolPromise;
  return pool;
};

export const getDb = async () => {
  const pool = await getConnection();
  return drizzle({ client: pool, schema } as any);
};
