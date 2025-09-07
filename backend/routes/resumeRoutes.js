import { Router } from "express";
import { uploadMiddleware, uploadResume, listResumes, getResumeById } from "../controllers/resumeController.js";

const router = Router();

router.post("/upload", uploadMiddleware, uploadResume);
router.get("/", listResumes);
router.get("/:id", getResumeById);

export default router;
