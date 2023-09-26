import { NextResponse, NextRequest } from "next/server";

import { makeQuery, QueryResponse } from "./query";

const DEFAULT_START_DAY = 30; // by default get data from 30 days ago

export type EventFilter = {
  name: string;
};

export type EvenTimeQuery = {
  fromDate: string | null;
  toDate: string | null;
  events: EventFilter[];
};

export type EventOverTimeData = {
  name: string;
  stats: QueryResponse[];
};

/**
 * Returns events count over time
 */
export async function GET(request: NextRequest) {
  // Get query params
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({}, { status: 404 });
  }

  const config: EvenTimeQuery = {
    toDate: searchParams.get("toDate"),
    fromDate: searchParams.get("fromDate"),
    events: [{ name }],
  };
  const data = await makeQuery(config);
  return NextResponse.json({ name, stats: data } as EventOverTimeData);
}
