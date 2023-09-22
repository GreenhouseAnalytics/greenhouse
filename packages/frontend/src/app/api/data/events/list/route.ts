import { NextResponse } from "next/server";

import { clickhouse } from "@/lib/clickhouse";

export async function GET() {
  const resultSet = await clickhouse.query({
    query: `
      SELECT name
      FROM event_inventory
      order by name
    `,
    format: "JSONEachRow",
  });
  const data = await resultSet.json<{ name: string }[]>();

  return NextResponse.json({ events: data.map((i) => i.name) });
}
