import multer from "multer";
import csvParser from "csv-parser";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response } from "express";
import AppError from "../modules/error/services/AppError";

const upload = multer({ dest: "uploads/" }); // ذخیره فایل‌های آپلود شده در پوشه "uploads"

// Middleware پردازش داده‌های ورودی
const processDataMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log("Req body: ", req.body);
  console.log("Req files: ", req.file);
  try {
    if (JSON.parse(req.body.data).length > 0) {
      console.log("data");
      req.processedData = new Float64Array(JSON.parse(req.body.data));
      return next();
    }

    if (req.file) {
      console.log("file");
      const filePath = path.join("uploads", req.file.filename);
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext === ".csv") {
        // پردازش فایل CSV
        const results: any = [];
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (row) => {
            results.push(Object.values(row).map(Number)[0]);
          })
          .on("end", () => {
            req.processedData = new Float64Array(results);
            fs.unlinkSync(filePath); // حذف فایل پس از پردازش
            next();
          });
      } else if (ext === ".xls" || ext === ".xlsx") {
        // پردازش فایل Excel
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const sheet = workbook.worksheets[0];

        const data: any = [];
        sheet.eachRow((row) => {
          const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
          data.push(rowValues[0]);
        });

        req.processedData = new Float64Array(data);
        fs.unlinkSync(filePath);
        next();
      } else {
        return next(new AppError("فرمت فایل نامعتبر است", 400));
      }
    } else {
      return next(new AppError("داده‌ای ارسال نشده است", 400));
    }
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
};

// تنظیم میدلور آپلود فایل
const uploadMiddleware = upload.single("file");

export { uploadMiddleware, processDataMiddleware };
