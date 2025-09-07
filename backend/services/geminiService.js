// backend/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.2,
    responseMimeType: "application/json" // force JSON-only response
  }
});

export async function askGeminiForJson(resumeText) {
  const t0 = Date.now();

  const prompt = `
You are an expert technical recruiter and career coach.
Extract information from the resume text below and return ONLY a valid JSON object.
Do not include any commentary, code fences, or markdown.

Resume Text:
"""
${resumeText}
"""

Return JSON with EXACT keys and shapes:

{
  "name": "string | null",
  "email": "string | null",
  "phone": "string | null",
  "linkedin_url": "string | null",
  "portfolio_url": "string | null",
  "summary": "string | null",
  "work_experience": [
    { "role": "string", "company": "string", "duration": "string", "location": "string | null", "description": ["string"] }
  ],
  "education": [
    { "degree": "string", "institution": "string", "graduation_year": "string | null", "grade": "string | null" }
  ],
  "technical_skills": ["string"],
  "soft_skills": ["string"],
  "projects": [
    { "title": "string", "description": "string | null", "tech_stack": ["string"], "link": "string | null" }
  ],
  "certifications": [
    { "name": "string", "issuer": "string | null", "year": "string | null" }
  ],
  "resume_rating": "number (1-10)",
  "improvement_areas": "string",
  "upskill_suggestions": ["string"]
}
`.trim();

  const result = await model.generateContent(prompt);
  const raw = result?.response?.text?.() ?? "";
  return { raw, llm_ms: Date.now() - t0 };
}

export function asJsonOrNull(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
