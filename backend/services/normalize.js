// backend/services/normalize.js
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const urlRx = /^https?:\/\/[^\s]+$/i;
const phoneRx = /^[+\d][\d\s\-()]{6,}$/;

export function coerceAndFill(srcIn) {
  const src = srcIn && typeof srcIn === "object" ? srcIn : {};

  // helpers used during shaping
  function clamp(s, n) { if (s == null) return s; s = String(s); return s.length > n ? s.slice(0, n) : s; }
  const asArray = v => (Array.isArray(v) ? v : v == null ? [] : [v]);
  const str = v => (v == null ? "" : String(v).trim());
  const nullableStr = v => {
    const s = v == null ? "" : String(v).trim();
    return s ? s : null;
  };
  const uniqStrings = arr =>
    Array.from(new Set((Array.isArray(arr) ? arr : []).map(s => String(s).trim()).filter(Boolean)));

  // Build a clean, whitelisted object
  const o = {
    name: nullableStr(src.name),
    email: nullableStr(src.email),
    phone: nullableStr(src.phone),
    linkedin_url: nullableStr(src.linkedin_url),
    portfolio_url: nullableStr(src.portfolio_url),
    summary: nullableStr(src.summary),

    work_experience: asArray(src.work_experience).map(wx => ({
      role: str(wx?.role),
      company: str(wx?.company),
      duration: str(wx?.duration),
      location: nullableStr(wx?.location),
      description: asArray(wx?.description).map(str).filter(Boolean).slice(0, 12)
    })),

    education: asArray(src.education).map(ed => ({
      degree: str(ed?.degree),
      institution: str(ed?.institution),
      graduation_year: nullableStr(ed?.graduation_year),
      grade: nullableStr(ed?.grade)
    })),

    technical_skills: uniqStrings(asArray(src.technical_skills).map(str).filter(Boolean)).slice(0, 200),
    soft_skills: uniqStrings(asArray(src.soft_skills).map(str).filter(Boolean)).slice(0, 100),

    projects: asArray(src.projects).map(p => ({
      title: str(p?.title),
      description: nullableStr(p?.description),
      tech_stack: uniqStrings(asArray(p?.tech_stack).map(str).filter(Boolean)).slice(0, 50),
      link: nullableStr(p?.link)
    })),

    certifications: asArray(src.certifications).map(c => ({
      name: str(c?.name),
      issuer: nullableStr(c?.issuer),
      year: nullableStr(c?.year)
    })),

    resume_rating: coerceRating(src.resume_rating),
    improvement_areas: str(src.improvement_areas),
    upskill_suggestions: asArray(src.upskill_suggestions).map(str).filter(Boolean).slice(0, 12)
  };

  // Defaults to satisfy required fields
  if (o.resume_rating == null) o.resume_rating = 5; // safe default within 1..10
  if (!Array.isArray(o.upskill_suggestions) || o.upskill_suggestions.length === 0) {
    o.upskill_suggestions = ["Add role-specific tools and ATS keywords."];
  }

  // Clamp to schema max lengths
  o.name = o.name ? clamp(o.name, 120) : null;
  o.email = o.email ? clamp(o.email, 200) : null;
  o.phone = o.phone ? clamp(o.phone, 50) : null;
  o.linkedin_url = o.linkedin_url ? clamp(o.linkedin_url, 300) : null;
  o.portfolio_url = o.portfolio_url ? clamp(o.portfolio_url, 300) : null;
  o.summary = o.summary ? clamp(o.summary, 2000) : null;

  o.work_experience = (o.work_experience || []).map(w => ({
    role: clamp(w.role, 120),
    company: clamp(w.company, 160),
    duration: clamp(w.duration, 120),
    location: w.location ? clamp(w.location, 120) : null,
    description: (w.description || []).map(d => clamp(d, 300))
  }));

  o.education = (o.education || []).map(ed => ({
    degree: clamp(ed.degree, 160),
    institution: clamp(ed.institution, 200),
    graduation_year: ed.graduation_year ? clamp(ed.graduation_year, 10) : null,
    grade: ed.grade ? clamp(ed.grade, 40) : null
  }));

  o.projects = (o.projects || []).map(p => ({
    title: clamp(p.title, 160),
    description: p.description ? clamp(p.description, 600) : null,
    tech_stack: (p.tech_stack || []).map(t => clamp(t, 60)),
    link: p.link ? clamp(p.link, 300) : null
  }));

  o.certifications = (o.certifications || []).map(c => ({
    name: clamp(c.name, 200),
    issuer: c.issuer ? clamp(c.issuer, 160) : null,
    year: c.year ? clamp(c.year, 10) : null
  }));

  o.technical_skills = (o.technical_skills || []).map(s => clamp(s, 60));
  o.soft_skills = (o.soft_skills || []).map(s => clamp(s, 60));
  o.upskill_suggestions = (o.upskill_suggestions || []).map(s => clamp(s, 120));

  return o;
}

export function normalize(res) {
  const out = { ...res };

  // Clamp rating into 1..10
  if (typeof out.resume_rating === "number") {
    out.resume_rating = Math.min(10, Math.max(1, Math.round(out.resume_rating)));
  } else {
    out.resume_rating = 5;
  }

  // Validate simple scalar formats (tolerant: keep invalid strings but you can null them if you prefer)
  out.email = okOrNull(out.email, emailRx);
  out.linkedin_url = okOrNull(out.linkedin_url, urlRx);
  out.portfolio_url = okOrNull(out.portfolio_url, urlRx);
  out.phone = okOrNull(out.phone, phoneRx);

  // Dedupe skills again post-trim
  out.technical_skills = uniqStrings(out.technical_skills);
  out.soft_skills = uniqStrings(out.soft_skills);

  if (Array.isArray(out.projects)) {
    out.projects = out.projects.map(p => ({ ...p, tech_stack: uniqStrings(p.tech_stack) }));
  }

  return out;
}

// ---- helpers used by normalize() ----
function coerceRating(v) { const n = Number(v); return Number.isFinite(n) ? Math.min(10, Math.max(1, Math.round(n))) : null; }
function okOrNull(v, rx) { if (v == null || String(v).trim()==="") return null; const s=String(v).trim(); return rx.test(s)?s:s; }
function uniqStrings(arr) { if (!Array.isArray(arr)) return []; return Array.from(new Set(arr.map(s => String(s).trim()).filter(Boolean))); }
