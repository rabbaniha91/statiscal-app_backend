import { ckmeans, mean, standardDeviation } from "simple-statistics";

export const analyzeDataType = (data: number[]) => {
  const uniqueValues = new Set(data).size;
  return uniqueValues / data.length < 0.1 ? "discrete" : "continuous";
};

// export const calculateHistogram = async (data: number[]) => {
//   // محاسبه تعداد خوشه‌ها با استفاده از قانون Freedman-Diaconis
//   const iqr = interquartileRange(data); // محدوده بین چارکی
//   const binWidth = (2 * iqr) / Math.cbrt(data.length); // قانون Freedman-Diaconis

//   const { min, max } = calculateMinMax(data);
//   const binCount = Math.ceil((max - min) / binWidth); // تعداد بین‌ها

//   // اگر binCount مقدار نامعتبر داشت، حداقل 1 بین در نظر بگیر
//   const bins = ckmeans(data, Math.max(binCount, 1));

//   return bins
//     .map((bin) => ({
//       x: mean(bin), // مقدار میانگین هر بین
//       count: bin.length, // تعداد نقاط داده در این بین
//     }))
//     .sort((a, b) => a.x - b.x);
// };

export const calculateHistogram = async (data: Float64Array) => {
  if (data.length === 0) return [];

  // محاسبه min و max بدون تبدیل به آرایه معمولی
  let min = data[0],
    max = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }

  // محاسبه محدوده بین چارکی (IQR)
  const sortedData = new Float64Array(data).sort();
  const q1 = sortedData[Math.floor(sortedData.length * 0.25)];
  const q3 = sortedData[Math.floor(sortedData.length * 0.75)];
  const iqr = q3 - q1;

  const binWidth = (2 * iqr) / Math.cbrt(data.length);
  const binCount = Math.max(Math.ceil((max - min) / binWidth), 1);

  // تخصیص بافر برای شمارش بین‌ها
  const counts = new Uint32Array(binCount);
  const binMeans = new Float64Array(binCount);

  // پر کردن بین‌ها
  for (let i = 0; i < data.length; i++) {
    const index = Math.min(binCount - 1, Math.floor((data[i] - min) / binWidth));
    counts[index]++;
    binMeans[index] += data[i];
  }

  // محاسبه میانگین هر بین
  for (let i = 0; i < binCount; i++) {
    if (counts[i] > 0) {
      binMeans[i] /= counts[i];
    }
  }

  // ساخت خروجی
  return Array.from({ length: binCount }, (_, i) => ({
    x: binMeans[i],
    count: counts[i],
  })).filter((bin) => bin.count > 0);
};

export const calculateDiscreteHistogram = (data: number[]) => {
  const counts: Record<number, number> = {};

  data.forEach((num) => {
    counts[num] = (counts[num] || 0) + 1;
  });

  return Object.keys(counts)
    .map((key) => ({
      x: Number(key),
      count: counts[Number(key)],
    }))
    .sort((a, b) => a.x - b.x);
};

// export const calculateDensity = (data: number[]) => {
//   const means = mean(data);
//   const stdev = standardDeviation(data);
//   // const min = Math.min(...data);
//   // const max = Math.max(...data);
//   const { min, max } = calculateMinMax(data);
//   const step = (max - min) / 100;

//   return Array.from({ length: 101 }, (_, i) => {
//     const x = min + i * step;
//     const y = (1 / (stdev * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - means, 2) / (2 * Math.pow(stdev, 2)));
//     return { x: Number(x.toFixed(3)), value: y };
//   });
// };

export const calculateDensity = async (data: Float64Array) => {
  if (data.length === 0) return [];

  let min = data[0],
    max = data[0],
    sum = 0,
    sumSq = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    sumSq += data[i] * data[i];
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }

  const means = sum / data.length;
  const variance = sumSq / data.length - means * means;
  const stdev = Math.sqrt(variance);
  const step = (max - min) / 100;

  return Array.from({ length: 101 }, (_, i) => {
    const x = min + i * step;
    const y = (1 / (stdev * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - means, 2) / (2 * Math.pow(stdev, 2)));
    return { x: Number(x.toFixed(3)), value: y };
  });
};
