import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

// Build config from either DATABASE_URL or discrete vars
const cfg = connectionString
  ? { connectionString }
  : {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || "resume_analyzer",
    };

// Turn on TLS if DB_SSL=1 or the URL says sslmode=require
if (process.env.DB_SSL === "1" || /sslmode=require/i.test(connectionString || "")) {
  cfg.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(cfg);

export async function pingDB() {
  const r = await pool.query("SELECT NOW() AS now");
  return r.rows[0].now;
}
