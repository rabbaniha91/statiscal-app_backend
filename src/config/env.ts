import dotenv from "dotenv";
dotenv.config();

export const envs = {
  PORT: process.env.PORT as string,
  MONGO_URI: process.env.MONGO_URI as string,
  JWT_SECRET_REFRESH: process.env.JWT_SECRET_REFRESH as string,
  JWT_SECRET_ACCESS: process.env.JWT_SECRET_ACCESS as string,
  openaiKey: process.env.OPEN_AI_KEY as string,
  aiModel: process.env.AIMODEL as string,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  deepseekBaseUri: process.env.DEEPSEEK_BASE_URI,
} as const;
