import mongoose from "mongoose";

export const dbConnect = async (MONGO_URI) => {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Connected to database ✅");
    })
    .catch((err) => {
      console.error("Error in connect to database❌:", err);
      process.exit(1);
    });

  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("Database disconnected📴");
    process.exit(0);
  });
};
