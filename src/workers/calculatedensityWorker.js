import { mean, standardDeviation } from "simple-statistics";
import { workerData, parentPort } from "worker_threads";

parentPort?.postMessage(calculateDensity(workerData));

function calculateDensity(data) {
  const means = mean(data);
  const stdev = standardDeviation(data);
  // const min = Math.min(...data);
  // const max = Math.max(...data);
  const { min, max } = calculateMinMax(data);
  const step = (max - min) / 100;

  return Array.from({ length: 101 }, (_, i) => {
    const x = min + i * step;
    const y = (1 / (stdev * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - means, 2) / (2 * Math.pow(stdev, 2)));
    return { x: Number(x.toFixed(3)), value: y };
  });
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
