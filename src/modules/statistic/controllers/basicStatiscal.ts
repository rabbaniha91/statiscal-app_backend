import { NextFunction, Request, Response } from "express";
import { max, mean, median, min, quantile, sampleSkewness, standardDeviation, variance } from "simple-statistics";
import { Worker } from "worker_threads";
import AppError from "../../error/services/AppError";
import {
  analyzeDataType,
  calculateDensity,
  calculateDiscreteHistogram,
  calculateHistogram,
} from "../services/basicStatisticalCalculations";

export const calcBasic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.processedData;
    if (data) {
      const meanOfData = mean(data);
      const q2 = median(data);
      const varians = variance(data);
      const stdDev = standardDeviation(data);
      const q1 = quantile(data, 0.25);
      const q3 = quantile(data, 0.75);
      const cv = (stdDev / meanOfData) * 100;
      const minOfData = min(data);
      const maxOfData = max(data);
      const skewness = sampleSkewness(data);

      const basicAnalyze = {
        mean: meanOfData,
        median: q2,
        varians,
        stdDev,
        q1,
        q3,
        cv,
        min: minOfData,
        max: maxOfData,
        skewness,
      };

      const dataType = analyzeDataType(data);
      const density = await calculateDensity(data);

      let ferquency;

      if (dataType === "continuous") {
        ferquency = await calculateHistogram(data);
      } else if (dataType === "discrete") {
        ferquency = calculateDiscreteHistogram(data);
      }
      console.log("ferquency: ", ferquency);

      res.json({
        message: "Calculation successfull",
        results: {
          basicAnalyze,
          rowData: data,
          ferquency,
          density,
          dataType,
        },
      });
    }
  } catch (error: any) {
    next(new AppError(`Server error: ${error.message}`, 500));
  }
};
