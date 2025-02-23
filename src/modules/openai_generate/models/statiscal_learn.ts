import mongoose from "mongoose";

const stattiscalLearnSchema = new mongoose.Schema(
  {
    topic: { type: String, text: true, time: true },
    content: { type: String, trim: true },
    aiModel: { type: String, text: true, time: true },
  },
  { timestamps: true }
);

export default mongoose.model("StatiscalLearn", stattiscalLearnSchema);
