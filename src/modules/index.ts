import { Router } from "express";
import userRouter from "./user/routes";
import calcRouter from "./statistic/routes";
import aiLearningRouter from "./openai_generate/routes";

const mainRouter = Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/statistic", calcRouter);
mainRouter.use("/ai_learning", aiLearningRouter);

export default mainRouter;
