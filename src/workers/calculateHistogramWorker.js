import { ckmeans } from "simple-statistics";
import { workerData, parentPort } from "worker_threads";

parentPort?.postMessage(calculateHistogram(workerData));

function calculateHistogram(data) {
  // محاسبه تعداد خوشه‌ها با استفاده از قانون Freedman-Diaconis
  const iqr = interquartileRange(data); // محدوده بین چارکی
  const binWidth = (2 * iqr) / Math.cbrt(data.length); // قانون Freedman-Diaconis
  const { min, max } = calculateMinMax(data);
  const binCount = Math.ceil((max - min) / binWidth); // تعداد بین‌ها

  // اگر binCount مقدار نامعتبر داشت، حداقل 1 بین در نظر بگیر
  const bins = ckmeans(data, Math.max(binCount, 1));

  return bins
    .map((bin) => ({
      x: mean(bin), // مقدار میانگین هر بین
      count: bin.length, // تعداد نقاط داده در این بین
    }))
    .sort((a, b) => a.x - b.x);
}

function calculateMinMax(data) {
  let min = data[0];
  let max = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }
  return { min, max };
}

function quickselect(arr, k, left = 0, right = arr.length - 1) {
  if (left === right) return arr[left];
  const pivotIndex = partition(arr, left, right);
  if (k === pivotIndex) return arr[k];
  return k < pivotIndex ? quickselect(arr, k, left, pivotIndex - 1) : quickselect(arr, k, pivotIndex + 1, right);
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;
  for (let j = left; j < right; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

function quantile(data, p) {
  const index = (data.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return data[lower] + (data[upper] - data[lower]) * (index - lower);
}

function interquartileRange(data) {
  const sorted = [...data];
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  quickselect(sorted, q1Index);
  quickselect(sorted, q3Index);
  return quantile(sorted, 0.75) - quantile(sorted, 0.25);
}
