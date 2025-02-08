import http from "http";
import app from "./app.js";
import { dbConnect } from "./config/dbConnect.js";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const server = http.createServer(app);

dbConnect(MONGO_URI).then(() => {
  server.listen(PORT, () => {
    console.log(`Server is run on port ${PORT}`);
  });
});
