import { NextResponse } from "next/server";

import { clickhouse } from "@/lib/clickhouse";

export async function GET() {
  const resultSet = await clickhouse.query({
    query: `
      SELECT DISTINCT event
      FROM event
      order by event
    `,
    format: "JSONEachRow",
  });
  const data = await resultSet.json<{ event: string }[]>();

  return NextResponse.json({ events: data.map((i) => i.event) });
}
