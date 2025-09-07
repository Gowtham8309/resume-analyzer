// backend/services/pdfService.js
// Lazy-load the internal implementation to avoid the package's index side-effects.

export async function extractTextFromPdf(buffer) {
  // Try ESM path first
  try {
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = mod.default || mod;
    const t0 = Date.now();
    const parsed = await pdfParse(buffer);
    const text = (parsed.text || "")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return { text, parse_ms: Date.now() - t0, pages: parsed.numpages || 0 };
  } catch (e) {
    // Fallback for environments that prefer CJS resolution
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");
    const t0 = Date.now();
    const parsed = await pdfParse(buffer);
    const text = (parsed.text || "")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return { text, parse_ms: Date.now() - t0, pages: parsed.numpages || 0 };
  }
}
