import pg from "pg";
const { Pool } = pg;

if (!process.env.DB_PASSWORD || typeof process.env.DB_PASSWORD !== "string") {
  console.error("DB_PASSWORD is missing or not a string. Check backend/.env");
}

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,  // must be a string
  port: Number(process.env.DB_PORT || 5432),
  max: 10,
  idleTimeoutMillis: 30000
});

export async function pingDB() {
  const r = await pool.query("SELECT NOW() as now");
  return r.rows[0].now;
}
