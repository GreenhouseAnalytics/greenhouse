import { NextResponse } from "next/server";

import { clickhouse } from "@/lib/clickhouse";

export async function GET() {
  const resultSet = await clickhouse.query({
    query: `
      SELECT DISTINCT event
      FROM event
    `,
    format: "JSONEachRow",
  });
  const data = await resultSet.json();

  return NextResponse.json({ data });
}
