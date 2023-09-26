import { createClient } from "@clickhouse/client";
import { knex as knexConnect } from "knex";

export const clickhouse = createClient({
  host: process.env.CLICKHOUSE_HOST ?? "http://localhost:8123",
  database: process.env.CLICKHOUSE_DB ?? "greenhouse",
  username: process.env.CLICKHOUSE_USER ?? "default",
  password: process.env.CLICKHOUSE_PASSWORD,
  compression: {
    response: true,
    request: true,
  },
});

export const knex = knexConnect({
  client: "mysql",
  connection: {
    port: process.env.DATABASE_MYSQL_PORT
      ? parseInt(process.env.DATABASE_MYSQL_PORT)
      : 9005,
    host: process.env.DATABASE_PG_HOST,
    database: process.env.CLICKHOUSE_DB,
    user: "service",
    password: "password",
    ssl: false,
  },
});
