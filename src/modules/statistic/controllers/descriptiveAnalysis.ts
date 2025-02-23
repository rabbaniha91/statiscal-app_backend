import { NextFunction, Request, Response } from "express";
import AppError from "../../error/services/AppError";
import path from "path";

const __dirname = import.meta.dirname;

interface EmscriptenModule {
  cwrap: (name: string, returnType: string | null, argTypes: string[]) => Function;
  ccall: (name: string, returnType: string | null, argTypes: string[], args: any[]) => any;
  _malloc: (size: number) => number;
  _free: (pointer: number) => void;
  HEAPF64: Float64Array;
  HEAP32: Int32Array;
  setValue: (ptr: number, value: number, type: string) => void;
  getValue: (ptr: number, type: string) => number;
}

let wasmModule: any = null;
const numPoints = 201;

async function initializeWasmModule() {
  try {
    const wasmModulePath = path.resolve(__dirname, "../../../../wasm/wasm/descriptiveAnalysis.mjs");
    const EmscriptenModule = await import("file://" + wasmModulePath);
    wasmModule = await EmscriptenModule.default();

    if (typeof wasmModule._malloc !== "function" || typeof wasmModule._free !== "function") {
      throw new Error("Required memory management functions are not available");
    }

    console.log("WASM module loaded successfully");
    return wasmModule;
  } catch (error) {
    console.error("Failed to initialize WASM module:", error);
    throw error;
  }
}

// تابع کمکی برای تخصیص آرایه به حافظه WASM
function allocateArray(module: typeof wasmModule, arr: number[]): number {
  const bytes = arr.length * 8;
  const ptr = module._malloc(bytes);
  for (let i = 0; i < arr.length; i++) {
    module.HEAPF64[ptr / 8 + i] = arr[i];
  }
  return ptr;
}

// تابع کمکی برای خواندن آرایه از حافظه WASM
function getFloat64Array(module: typeof wasmModule, ptr: number, length: number): number[] {
  return Array.from(module.HEAPF64.subarray(ptr / 8, ptr / 8 + length));
}

export const calc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.processedData;
    const { dataType } = req.body;

    if (!dataType) return next(new AppError("Please specify the data type.", 400));

    if (!wasmModule) {
      throw new Error("WASM module not initialized");
    }

    if (data) {
      // تخصیص حافظه برای داده‌های ورودی
      const dataPtr = allocateArray(wasmModule, data);

      try {
        const meanOfData = wasmModule.ccall("mean", "number", ["number", "number"], [dataPtr, data.length]);
        const varians = wasmModule.ccall("variance", "number", ["number", "number"], [dataPtr, data.length]);
        const stdDev = wasmModule.ccall("standardDeviation", "number", ["number", "number"], [dataPtr, data.length]);
        const rangeValue = wasmModule.ccall("range", "number", ["number", "number"], [dataPtr, data.length]);
        const interquartileRange = wasmModule.ccall("interquartileRange", "number", ["number", "number"], [dataPtr, data.length]);
        const skewness = wasmModule.ccall("skewness", "number", ["number", "number"], [dataPtr, data.length]);
        const kurtosis = wasmModule.ccall("kurtosis", "number", ["number", "number"], [dataPtr, data.length]);
        const cv = (stdDev / meanOfData) * 100;

        // محاسبه مینیمم و ماکزیمم
        const minMaxPtr = wasmModule._malloc(2 * 8);
        wasmModule.ccall("minMax", null, ["number", "number", "number"], [dataPtr, data.length, minMaxPtr]);
        const [min, max] = getFloat64Array(wasmModule, minMaxPtr, 2);

        wasmModule._free(minMaxPtr);

        // محاسبه چارک‌ها
        const quartilesPtr = wasmModule._malloc(3 * 8);
        wasmModule.ccall("quartiles", null, ["number", "number", "number"], [dataPtr, data.length, quartilesPtr]);
        const quartiles = getFloat64Array(wasmModule, quartilesPtr, 3);

        // منحنی چگال داده ها
        const generateNormalPDFPtr = wasmModule._malloc(numPoints * 8);
        wasmModule.ccall(
          "generateNormalPDF",
          null,
          ["number", "number", "number", "number"],
          [dataPtr, generateNormalPDFPtr, data.length, numPoints]
        );
        const normalizedPDFData = getFloat64Array(wasmModule, generateNormalPDFPtr, data.length);
        console.log("NormalData: ", normalizedPDFData);
        const lower = meanOfData - 4 * stdDev;
        const upper = meanOfData + 4 * stdDev;
        const step = (upper - lower) / (numPoints - 1);
        const generateNormalPDF = Array.from({ length: numPoints }, (_, i) => {
          const x = lower + i * step;
          return { x: Number(x.toFixed(3)), value: normalizedPDFData[i] };
        });

        // منحنی توزیع نرمال
        const xPtr = wasmModule._malloc(numPoints * 8);
        const yPtr = wasmModule._malloc(numPoints * 8);
        wasmModule.ccall(
          "generateNormalCurve",
          null,
          ["number", "number", "number", "number", "number"],
          [dataPtr, xPtr, yPtr, data.length, numPoints]
        );
        const xValues = getFloat64Array(wasmModule, xPtr, numPoints);
        const yValues = getFloat64Array(wasmModule, yPtr, numPoints);

        const normalData: Array<{ x: number; value: number }> = yValues.map((y, index) => ({
          x: xValues[index],
          value: y,
        }));

        wasmModule._free(xPtr);
        wasmModule._free(yPtr);

        // محاسبه فراوانی
        let frequency;
        let bins;
        if (dataType === "continuous") {
          bins = Math.ceil(Math.sqrt(data.length));
          const resultPtr = wasmModule.ccall("continuousHistogram", "number", ["number", "number", "number"], [dataPtr, data.length, bins]);

          if (resultPtr !== 0) {
            const frequencies = Array.from(wasmModule.HEAPF64.subarray(resultPtr / 8, resultPtr / 8 + bins));

            const binCenters = Array.from(wasmModule.HEAPF64.subarray(resultPtr / 8 + bins, resultPtr / 8 + 2 * bins));

            frequency = binCenters.map((value, index) => ({
              value,
              count: frequencies[index],
            }));

            wasmModule._free(resultPtr);
          }
        } else {
          // برای داده‌های گسسته
          const maxUniqueValues = new Set(data).size;
          const valuesPtr = wasmModule._malloc(maxUniqueValues * 8);
          const frequenciesPtr = wasmModule._malloc(maxUniqueValues * 4);
          const uniqueCountPtr = wasmModule._malloc(4);

          wasmModule.ccall(
            "discreteFrequencies",
            null,
            ["number", "number", "number", "number", "number"],
            [dataPtr, data.length, valuesPtr, frequenciesPtr, uniqueCountPtr]
          );

          const uniqueCount = wasmModule.HEAP32[uniqueCountPtr / 4];
          const values = getFloat64Array(wasmModule, valuesPtr, uniqueCount);
          const frequencies = Array.from(wasmModule.HEAP32.subarray(frequenciesPtr / 4, frequenciesPtr / 4 + uniqueCount));

          frequency = values.map((value, index) => ({
            value,
            count: frequencies[index],
          }));

          wasmModule._free(valuesPtr);
          wasmModule._free(frequenciesPtr);
          wasmModule._free(uniqueCountPtr);
        }

        wasmModule._free(dataPtr);
        wasmModule._free(quartilesPtr);
        wasmModule._free(generateNormalPDFPtr);

        const basicAnalyze = {
          mean: meanOfData,
          median: quartiles[1],
          q1: quartiles[0],
          q3: quartiles[2],
          varians,
          stdDev,
          cv,
          min,
          max,
          skewness,
          range: rangeValue,
          interquartileRange,
          kurtosis,
        };

        res.json({
          message: "Calculation successful",
          results: {
            basicAnalyze,
            rowData: data,
            normalData,
            density: generateNormalPDF,
            frequency,
            dataType,
          },
        });
      } catch (error) {
        wasmModule._free(dataPtr);
        throw error;
      }
    }
  } catch (error: any) {
    console.error("Calculation error:", error);
    next(new AppError(`Server error: ${error.message}`, 500));
  }
};

initializeWasmModule();
