import { NextFunction, Request, Response } from "express";
import AppError from "../../error/services/AppError";
import { generateContentInEnglish, generateContentInFarsi } from "../services/generateStatiscalContent";
import { envs } from "../../../config/env";
import { create } from "../services/contentService";

export const generateLearningContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, lang } = req.body;
    if (!topic) return next(new AppError("Please send the topic", 400));
    if (!lang) return next(new AppError("Missing language", 400));
    if (lang !== "fa" && lang !== "en") return next(new AppError("Language should be 'fa' or 'en'", 400));

    const model = envs.aiModel;
    console.log("Model: ", model);
    const chatCompletion = lang === "fa" ? await generateContentInFarsi(topic, model) : await generateContentInEnglish(topic, model);
    console.log("Generated from ai: ", chatCompletion);
    const newGeneratedReoponse = await create(topic, chatCompletion.choices[0].message, model);
    console.log("Saved: ", newGeneratedReoponse);
    res.json({
      message: "Success",
      result: newGeneratedReoponse,
    });
  } catch (error: any) {
    console.log("Error: ", error);
    next(new AppError(error, 500));
  }
};
