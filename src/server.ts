import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
import { dbConnect } from "./config/dbConnect.js";
import { validateEnv } from "./utils/index.js";
import { envs } from "./config/env.js";

const server = http.createServer(app);

validateEnv();
dbConnect(envs.MONGO_URI).then(() => {
  server.listen(envs.PORT, () => {
    console.log(`Server is run on port ${envs.PORT}`);
  });
});
