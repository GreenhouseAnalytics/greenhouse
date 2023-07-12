import getConfig from "next/config";

const config = getConfig();

export const env = (config?.publicRuntimeConfig?.env ?? process.env) as {
  NODE_ENV: "development" | "production" | "test";
  JWT_SECRET: string;

  MONGODB_URI: string;

  CLICKHOUSE_HOST: string;
  CLICKHOUSE_DB: string;
  CLICKHOUSE_USER: string;
  CLICKHOUSE_PASSWORD: string;
};
