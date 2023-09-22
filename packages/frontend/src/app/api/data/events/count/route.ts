import { NextResponse, NextRequest } from "next/server";
import dayjs from "dayjs";

import { clickhouse } from "@/lib/clickhouse";

const DEFAULT_START_DAY = 30; // by default get data from 30 days ago

export async function GET(request: NextRequest) {
  // Get query params
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({}, { status: 404 });
  }

  // Parse to/from dates
  let toDate: string | null = null;
  let fromDate = dayjs()
    .subtract(DEFAULT_START_DAY, "days")
    .format("YYYY-MM-DD");
  if (searchParams.has("fromDate")) {
    fromDate = dayjs(searchParams.get("fromDate")).format("YYYY-MM-DD");
  }
  if (searchParams.has("toDate")) {
    toDate = dayjs(searchParams.get("toDate")).format("YYYY-MM-DD");
  }

  // Date conditions
  const dateConditions = [];
  let dateSql = "";
  if (fromDate) {
    dateConditions.push(`timestamp >= {fromDate: Date}`);
  }
  if (toDate) {
    dateConditions.push(`timestamp <= {toDate: Date}`);
  }
  if (dateConditions.length) {
    dateSql = `AND ${dateConditions.join(" AND ")}`;
  }

  // Run query
  const resultSet = await clickhouse.query({
    query_params: {
      name,
      fromDate,
      toDate,
    },
    query: `
      SELECT
        CAST(count(name) as INTEGER) as count,
        day
      FROM (
        SELECT
          event.*,
          toDate(timestamp) as day
        FROM event
        WHERE
          name = {name: String}
          ${dateSql}
        ORDER BY timestamp
      )
      GROUP BY day
    `,
    format: "JSONEachRow",
  });
  const data = await resultSet.json<{ name: string }[]>();

  return NextResponse.json({ name, stats: data });
}
