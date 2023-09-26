import dayjs from "dayjs";
import { Knex } from "knex";
import { knex } from "@/lib/clickhouse";

import type { EvenTimeQuery, EventFilter } from "./route";

const DEFAULT_START_DAY = 30; // by default get data from 30 days ago
const DATE_FORMAT = "YYYY-MM-DD";

export type QueryResponse = {
  date: string;
  count: number;
}[];

/**
 * Build the query to fetch time-series data for one or more events
 */
export function makeQuery(queryConfig: EvenTimeQuery) {
  const params: Record<string, string | number> = {};

  const query = knex<QueryResponse>();
  setDateRangeFilter(query, queryConfig);

  query
    .with("all_data", (q) => {
      const eventQueries = queryConfig.events.map((event) => queryEvent(event));
      q.union(eventQueries);
    })
    .select("date", knex.raw("CAST(count(name) as INTEGER) as count"))
    .from("all_data")
    .groupBy("date");

  return query;
}

/**
 * Add date filters to the global params
 */
function setDateRangeFilter(
  query: Knex.QueryBuilder,
  queryConfig: EvenTimeQuery
) {
  let fromDate = dayjs()
    .subtract(DEFAULT_START_DAY, "days")
    .format(DATE_FORMAT);
  if (queryConfig.fromDate && dayjs(queryConfig.fromDate).isValid()) {
    fromDate = dayjs(queryConfig.fromDate).format(DATE_FORMAT);
  }

  // Add to query
  query.where((q) => {
    q.where("timestamp", ">=", fromDate);
    if (queryConfig.toDate && dayjs(queryConfig.toDate).isValid()) {
      q.andWhere(
        "timestamp",
        "<=",
        dayjs(queryConfig.fromDate).format(DATE_FORMAT)
      );
    }
  });
}

/**
 * Query for a particular event
 */
function queryEvent(event: EventFilter) {
  return knex("event")
    .select("*", knex.raw("toDate(timestamp) as date"))
    .where("name", event.name)
    .orderBy("timestamp");
}
