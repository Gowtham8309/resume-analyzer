// backend/services/validate.js
import Ajv from "ajv";
import { resumeSchema } from "../schema/resumeSchema.js";

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  coerceTypes: true,      // "8" -> 8
  useDefaults: true,      // apply defaults from schema
  allowUnionTypes: true,
  removeAdditional: "all" // strip unknown keys anywhere additionalProperties:false
});

const validateFn = ajv.compile(resumeSchema);

export function validateResumeJson(obj) {
  const ok = validateFn(obj);
  return { ok, errors: ok ? [] : validateFn.errors || [] };
}
