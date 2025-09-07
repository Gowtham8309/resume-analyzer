import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { pingDB } from "./db/index.js";
import resumeRoutes from "./routes/resumeRoutes.js";
// --- FORCE LOAD .env FROM backend/ ---
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("DB cfg", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  db: process.env.DB_DATABASE,
  pwType: typeof process.env.DB_PASSWORD,
  pwLen: (process.env.DB_PASSWORD || "").length
});
// --------------------------------------

const app = express();
const PORT = Number(process.env.PORT || 8000);
const ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use(helmet());
app.use(cors({ origin: ORIGIN, credentials: false }));
app.use(express.json({ limit: "1mb" }));

// Rate-limit uploads a bit
const uploadLimiter = rateLimit({
  windowMs: 60_000, // 1 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/health", async (req, res) => {
  try {
    const now = await pingDB();
    res.json({ status: "ok", db_time: now });
  } catch (e) {
    console.error("DB health error:", e.code, e.message);
    res
      .status(500)
      .json({ status: "error", db: "unreachable", code: e.code, msg: e.message });
  }
});

app.use("/api/resumes", uploadLimiter, resumeRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Unexpected error" } });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
