import { NextResponse, NextRequest } from "next/server";

import type { TimeSeriesQuery, TimeSeriesQueryResponse } from "./index";
import { Query } from "./query";

/**
 * Returns events count over time
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const query = body.query as TimeSeriesQuery;
  const queryBuilder = new Query(query);
  const events = await queryBuilder.run();

  const payload: TimeSeriesQueryResponse = {
    events,
    scale: events[0].data.map((i) => i.time),
  };
  return NextResponse.json(payload);
}
