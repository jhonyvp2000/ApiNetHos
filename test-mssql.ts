import sql from 'mssql';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '', 
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

async function test() {
  try {
    console.log("Connecting with config: ", config);
    const pool = await sql.connect(config);
    console.log("Connected to MSSQL Database.");
    
    const query = `
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'SITESIS' AND TABLE_NAME = 'PROCEDIMIENTOS'
      ORDER BY ORDINAL_POSITION;
    `;
    const result = await pool.request().query(query);
    console.log("SCHEMA COLUMNS:");
    console.log(JSON.stringify(result.recordset, null, 2));

    await pool.close();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
