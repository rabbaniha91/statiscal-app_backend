import { Router } from "express";
import { generateLearningContent } from "../controllers/generateLearningContent";

const router = Router();

router.post("/generate_learning", generateLearningContent);
router.get("/generated_content");

export default router;
