import { Router } from "express";
import { uploadMiddleware, processDataMiddleware } from "../../../middlewares/processData.js";
import { calc } from "../controllers/descriptiveAnalysis.js";

const router = Router();

router.post("/descriptive-analysis", uploadMiddleware, processDataMiddleware, calc);

export default router;
