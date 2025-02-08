import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./modules/error/controller";
import routes from "./modules";

dotenv.config();
const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found!" });
});

export default app;
