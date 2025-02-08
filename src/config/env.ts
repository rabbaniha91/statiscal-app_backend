export const envs = {
  PORT: process.env.PORT as string,
  MONGO_URI: process.env.MONGO_URI as string,
  JWT_SECRET_REFRESH: process.env.JWT_SECRET_REFRESH as string,
  JWT_SECRET_ACCESS: process.env.JWT_SECRET_ACCESS as string,
} as const;
