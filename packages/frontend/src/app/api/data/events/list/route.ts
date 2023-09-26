import { NextResponse } from "next/server";

import { knex } from "@/lib/clickhouse";

export async function GET() {
  const events = await knex<{ name: string }>("event_inventory")
    .select("name")
    .orderBy("name", "asc");

  return NextResponse.json({ events: events.map((i) => i.name) });
}
