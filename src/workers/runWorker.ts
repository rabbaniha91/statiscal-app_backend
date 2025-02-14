import { Worker } from "worker_threads";

export const runInWorker = <T>(file: string, data: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(file, { workerData: data });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};
