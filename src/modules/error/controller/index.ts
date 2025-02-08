import { NextFunction, Request, Response } from "express";
import AppError from "../services/AppError";

export const uncaughError = () => {
  process.on("uncaughtException", (err) => {
    console.log(`UNCAUGH EXCEPTION Shuting down ...`);
    console.log(err.name + " " + err.message);
    console.log(err);
    process.exit(1);
  });
};

export const unhandledError = (server: any) => {
  process.on("unhandledRejection", (err: any) => {
    console.log(`Unhandled Rejection shuting down ...`);
    console.log(err.name + " " + err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};

const handleEntityParseFailed = () => {
  let message = "رشته json ارسالی معتبر نیست";
  return new AppError(message, 400);
};

const sendErrorDev = (err: any, res: Response) => {
  console.error(err.message, err.status + "😢");
  res.status(err.statusCode).json({
    status: err.status,
    success: false,
    statusCode: err.statusCode,
    message: err.message + "❤️",
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    console.log("Error 🤦‍♀️", err);
    res.status(500).json({
      status: "error",
      message: "خطایی در سرور رخ داد!",
    });
  }
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV?.trim() === "development") {
    return sendErrorDev(err, res);
  } else if (process.env.NODE_ENV?.trim() === "production") {
    let error = { ...err, message: err.message };
    if (err.type === "entity.parse.failed") error = handleEntityParseFailed();
    return sendErrorProd(error, res);
  }
};
