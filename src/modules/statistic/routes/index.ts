import { Router } from "express";
import { uploadMiddleware, processDataMiddleware } from "../../../middlewares/processData.js";
import { calcBasic } from "../controllers/basicStatiscal.js";

const router = Router();

router.post("/calc-basic", uploadMiddleware, processDataMiddleware, calcBasic);

export default router;
