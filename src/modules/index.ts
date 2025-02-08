import { Router } from "express";
import userRouter from "./user/routes";

const mainRouter = Router();

mainRouter.use("/user", userRouter);

export default mainRouter;
