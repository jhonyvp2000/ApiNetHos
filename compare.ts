import sql from 'mssql';
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// PostgreSQL config from BackCQ
const PG_URL = "postgresql://jvp_user:V3l4p4r3d3s@178.156.220.22:6432/ogess";

const mssqlConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'ERPHOSPITAL',
  options: { encrypt: false, trustServerCertificate: true },
};

async function main() {
  const pgClient = new Client({ connectionString: PG_URL });
  
  try {
    console.log("Connecting to PostgreSQL...");
    await pgClient.connect();
    const pgRes = await pgClient.query('SELECT code, name FROM cq_diagnoses');
    const pgProcedures = pgRes.rows;
    console.log(`Found ${pgProcedures.length} diagnoses in POSTGRES (cq_diagnoses).`);

    console.log("Connecting to MSSQL...");
    const pool = await sql.connect(mssqlConfig);
    
    // Check columns of DIAGNOSTICOS first to know the exact names
    const cols = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'SITESIS' AND TABLE_NAME = 'DIAGNOSTICOS'");
    console.log("MSSQL SITESIS.DIAGNOSTICOS columns:", cols.recordset.map(r => r.COLUMN_NAME).join(', '));

    // Guessing columns CODIGO and NOMBRE, change if different
    const mssqlProceduresRes = await pool.request().query("SELECT RTRIM(CODIGO) as CODIGO, RTRIM(NOMBRE) as NOMBRE FROM SITESIS.DIAGNOSTICOS");
    const mssqlProcedures = mssqlProceduresRes.recordset;
    console.log(`Found ${mssqlProcedures.length} diagnoses in MSSQL (SITESIS.DIAGNOSTICOS).`);

    console.log("\n--- COMPARISON ANALYSIS ---");
    let exactMatches = 0;
    let missingInMssql = [];
    let nameMismatches = [];

    // Map MSSQL for fast lookup
    const mssqlMap = new Map();
    for (let row of mssqlProcedures) {
      mssqlMap.set(row.CODIGO, row.NOMBRE);
    }

    // Compare each PG procedure against MSSQL
    for (const pgRow of pgProcedures) {
      const msName = mssqlMap.get(pgRow.code);
      if (!msName) {
        missingInMssql.push(pgRow);
      } else if (msName.trim() !== pgRow.name.trim()) {
        nameMismatches.push({
          code: pgRow.code,
          pgName: pgRow.name,
          msName: msName
        });
      } else {
        exactMatches++;
      }
    }

    console.log(`\nExact Matches: ${exactMatches} out of ${pgProcedures.length} Postgres diagnoses.`);
    
    if (missingInMssql.length > 0) {
      console.log(`\nMissing in MSSQL (${missingInMssql.length} diagnoses):`);
      for (const m of missingInMssql.slice(0, 5)) {
        console.log(`  - ${m.code}: ${m.name}`);
      }
      if (missingInMssql.length > 5) console.log("  ...and more");
    }

    if (nameMismatches.length > 0) {
      console.log(`\nName Mismatches (${nameMismatches.length} diagnoses):`);
      for (const m of nameMismatches.slice(0, 5)) {
        console.log(`  Code: ${m.code}`);
        console.log(`    PG: ${m.pgName}`);
        console.log(`    MS: ${m.msName}`);
      }
      if (nameMismatches.length > 5) console.log("  ...and more");
    }

    if (exactMatches === pgProcedures.length) {
      console.log("\n✅ ALL diagnoses are perfectly registered and matching in both databases!");
    }

  } catch (error) {
    console.error("Error during comparison:", error);
  } finally {
    await pgClient.end();
    process.exit(0);
  }
}

main();
