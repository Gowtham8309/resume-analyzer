// backend/schema/resumeSchema.js
// Note: Removed `$schema` (draft 2020-12) to avoid Ajv meta-schema errors with the default build.
// If you want to keep 2020-12, switch to `ajv/dist/2020.js` in the validator instead.

export const resumeSchema = {
  $id: "resume-analysis",
  type: "object",
  required: [
    "resume_rating",
    "improvement_areas",
    "upskill_suggestions",
    "technical_skills",
    "soft_skills",
    "work_experience",
    "education"
  ],
  additionalProperties: false,
  properties: {
    name: { type: ["string", "null"], maxLength: 120 },
    email: { type: ["string", "null"], maxLength: 200 },
    phone: { type: ["string", "null"], maxLength: 50 },
    linkedin_url: { type: ["string", "null"], maxLength: 300 },
    portfolio_url: { type: ["string", "null"], maxLength: 300 },
    summary: { type: ["string", "null"], maxLength: 2000 },

    work_experience: {
      type: "array",
      default: [],
      items: {
        type: "object",
        required: ["role", "company", "duration", "description"],
        additionalProperties: false,
        properties: {
          role: { type: "string", maxLength: 120 },
          company: { type: "string", maxLength: 160 },
          duration: { type: "string", maxLength: 120 },
          location: { type: ["string", "null"], maxLength: 120 },
          description: {
            type: "array",
            maxItems: 12,
            items: { type: "string", maxLength: 300 }
          }
        }
      }
    },

    education: {
      type: "array",
      default: [],
      items: {
        type: "object",
        required: ["degree", "institution"],
        additionalProperties: false,
        properties: {
          degree: { type: "string", maxLength: 160 },
          institution: { type: "string", maxLength: 200 },
          graduation_year: { type: ["string", "null"], maxLength: 10 },
          grade: { type: ["string", "null"], maxLength: 40 }
        }
      }
    },

    technical_skills: {
      type: "array",
      default: [],
      maxItems: 200,
      items: { type: "string", maxLength: 60 }
    },

    soft_skills: {
      type: "array",
      default: [],
      maxItems: 100,
      items: { type: "string", maxLength: 60 }
    },

    projects: {
      type: "array",
      default: [],
      items: {
        type: "object",
        required: ["title"],
        additionalProperties: false,
        properties: {
          title: { type: "string", maxLength: 160 },
          description: { type: ["string", "null"], maxLength: 600 },
          tech_stack: {
            type: "array",
            maxItems: 50,
            items: { type: "string", maxLength: 60 }
          },
          link: { type: ["string", "null"], maxLength: 300 }
        }
      }
    },

    certifications: {
      type: "array",
      default: [],
      items: {
        type: "object",
        required: ["name"],
        additionalProperties: false,
        properties: {
          name: { type: "string", maxLength: 200 },
          issuer: { type: ["string", "null"], maxLength: 160 },
          year: { type: ["string", "null"], maxLength: 10 }
        }
      }
    },

    resume_rating: { type: "integer", minimum: 1, maximum: 10 },
    improvement_areas: { type: "string", maxLength: 1200 },
    upskill_suggestions: {
      type: "array",
      default: [],
      minItems: 1,
      maxItems: 12,
      items: { type: "string", maxLength: 120 }
    }
  }
};
