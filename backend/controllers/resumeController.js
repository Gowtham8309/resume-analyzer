import multer from "multer";
import { pool } from "../db/index.js";
import { extractTextFromPdf } from "../services/pdfService.js";
import { askGeminiForJson, asJsonOrNull } from "../services/geminiService.js";
import { validateResumeJson } from "../services/validate.js";
import { coerceAndFill, normalize } from "../services/normalize.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024 }
});

export const uploadMiddleware = upload.single("resume");

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json(err("BAD_REQUEST", "Missing 'resume' PDF file."));
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(415).json(err("UNSUPPORTED_MEDIA_TYPE", "Only PDF is accepted."));
    }

    const { text, parse_ms, pages } = await extractTextFromPdf(req.file.buffer);
    if (!text || text.length < 800) {
      return res.status(400).json(err("PDF_EMPTY", "Could not extract meaningful text. Please upload a text-based PDF (no scans)"));
    }

    // 1) LLM
    const { raw, llm_ms } = await askGeminiForJson(text);
    let obj = asJsonOrNull(raw);
    if (!obj) {
      return res.status(422).json(err("INVALID_JSON", "Model output was not valid JSON."));
    }

    // 2) Coerce & fill shape BEFORE validation
    obj = coerceAndFill(obj);

    // 3) Validate
    const { ok, errors } = validateResumeJson(obj);
    if (!ok) {
      return res.status(422).json(err("SCHEMA_VALIDATION_FAILED", "Model output did not match schema.", errors));
    }

    // 4) Normalize (emails/urls/skills/rating clamp, dedupe)
    const cleaned = normalize(obj);

    // 5) Persist
    const q = `
      INSERT INTO resumes (
        file_name, name, email, phone, linkedin_url, portfolio_url, summary,
        work_experience, education, technical_skills, soft_skills, projects, certifications,
        resume_rating, improvement_areas, upskill_suggestions
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13::jsonb,$14,$15,$16::jsonb)
      RETURNING id, uploaded_at
    `;
    const vals = [
      req.file.originalname,
      cleaned.name || null,
      cleaned.email || null,
      cleaned.phone || null,
      cleaned.linkedin_url || null,
      cleaned.portfolio_url || null,
      cleaned.summary || null,
      JSON.stringify(cleaned.work_experience || []),
      JSON.stringify(cleaned.education || []),
      JSON.stringify(cleaned.technical_skills || []),
      JSON.stringify(cleaned.soft_skills || []),
      JSON.stringify(cleaned.projects || []),
      JSON.stringify(cleaned.certifications || []),
      cleaned.resume_rating ?? null,
      cleaned.improvement_areas || null,
      JSON.stringify(cleaned.upskill_suggestions || [])
    ];
    const r = await pool.query(q, vals);
    const saved = { id: r.rows[0].id, uploaded_at: r.rows[0].uploaded_at };

    return res.status(201).json({
      data: {
        ...saved,
        file_name: req.file.originalname,
        ...cleaned
      },
      meta: { parse_ms, pages, llm_ms, source: process.env.GEMINI_MODEL || "gemini" }
    });
  } catch (e) {
    if (String(e.message || "").includes("File too large")) {
      return res.status(413).json(err("PAYLOAD_TOO_LARGE", "PDF exceeds size limit."));
    }
    if (String(e.message || "").toLowerCase().includes("timeout")) {
      return res.status(502).json(err("LLM_TIMEOUT", "AI service timed out. Please retry."));
    }
    next(e);
  }
}

export async function listResumes(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const q = (req.query.q || "").trim();

    let where = "";
    let params = [limit, offset];
    if (q) {
      where = `WHERE (LOWER(name) LIKE $3 OR LOWER(email) LIKE $3 OR LOWER(file_name) LIKE $3)`;
      params = [limit, offset, `%${q.toLowerCase()}%`];
    }

    const listSql = `
      SELECT id, file_name, name, email, uploaded_at, resume_rating
      FROM resumes
      ${where}
      ORDER BY uploaded_at DESC
      LIMIT $1 OFFSET $2
    `;
    const totalSql = `
      SELECT COUNT(*)::int AS total FROM resumes ${where.replace("$3", "$1")}
    `;

    const [rows, total] = await Promise.all([
      pool.query(listSql, params),
      pool.query(q ? totalSql : "SELECT COUNT(*)::int AS total FROM resumes", q ? [params[2]] : [])
    ]);

    res.json({ data: rows.rows, meta: { total: total.rows[0].total, limit, offset } });
  } catch (e) {
    next(e);
  }
}

export async function getResumeById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const r = await pool.query(`
      SELECT
        id, file_name, uploaded_at, name, email, phone, linkedin_url, portfolio_url, summary,
        work_experience, education, technical_skills, soft_skills, projects, certifications,
        resume_rating, improvement_areas, upskill_suggestions
      FROM resumes WHERE id = $1
    `, [id]);
    if (!r.rowCount) return res.status(404).json(err("NOT_FOUND", "No resume with that id."));
    res.json({ data: r.rows[0] });
  } catch (e) {
    next(e);
  }
}

function err(code, message, details) {
  const out = { error: { code, message } };
  if (details) out.error.details = details;
  return out;
}
