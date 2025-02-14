import { Router } from "express";
import userRouter from "./user/routes";
import calcRouter from "./statistic/routes";

const mainRouter = Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/statistic", calcRouter);

export default mainRouter;
