import { NextFunction, Request, Response } from "express";

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error: any) {
    console.error("Error in authenticate: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
