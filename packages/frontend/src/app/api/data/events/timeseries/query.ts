import dayjs, { Dayjs } from "dayjs";
import { Knex } from "knex";
import { knex } from "@/lib/clickhouse";

import type {
  TimeSeriesQuery,
  EventFilter,
  TimeSeriesEvents,
  TimeSeriesEventItem,
} from "./index";

const DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss";

type QueryResponse = {
  name: string;
  time: string;
  count: number;
};

type ExactTimeWindow = {
  start: Dayjs;
  end: Dayjs;
};

export class Query {
  config: TimeSeriesQuery;
  timeWindow: ExactTimeWindow;
  sqlQuery: Knex.QueryBuilder<QueryResponse, QueryResponse[]>;

  constructor(config: TimeSeriesQuery) {
    this.config = config;
    this.sqlQuery = knex.queryBuilder<QueryResponse>();
    this.timeWindow = this.timeWindow = {
      start: dayjs().subtract(1, "day"),
      end: dayjs(),
    };

    this.calculateTimeWindow();
  }

  /**
   * Calculate the fixed time window to query with
   */
  calculateTimeWindow() {
    const window = this.config.timeWindow;

    // Fixed date range
    if (window.type === "fixed") {
      if (window.start && dayjs(window.start).isValid()) {
        this.timeWindow.start = dayjs(window.start);
      }
      if (window.end && dayjs(window.end).isValid()) {
        this.timeWindow.end = dayjs(window.end);
      }
    }
    // Relative date range
    else if (window.type === "relative") {
      if (typeof window.start === "number") {
        this.timeWindow.start = dayjs()
          .add(window.start, window.unit)
          .startOf(window.unit);
      }
      if (typeof window.end === "number") {
        this.timeWindow.end = dayjs()
          .add(window.end, window.unit)
          .endOf(window.unit);
      }
    }
    // Unknown time window
    else {
      console.warn(`Unknown window type`);
    }
  }

  /**
   * Create the time scale table to join to with all of the time points of the scale.
   */
  createTimescaleTable() {
    const params = {
      unit: this.config.aggregateTimeUnit,
      start: this.timeWindow.start.format(DATE_FORMAT),
      end: this.timeWindow.end.format(DATE_FORMAT),
    };

    // Ensure the value is expected, because we're injecting it directly into the SQL
    const intervalUnit = this.config.aggregateTimeUnit;
    if (!["hour", "day", "week", "month"].includes(intervalUnit)) {
      throw new Error(`Invalid aggregation unit: '${intervalUnit}'`);
    }

    this.sqlQuery.with("timescale", (q) => {
      q.select(
        knex.raw(
          `dateTrunc(:unit,
            toDateTime(:start) + INTERVAL number ${intervalUnit}
          ) as time`,
          params
        )
      ).from(
        knex.raw(
          `numbers(
            toUInt64(
              dateDiff(
                :unit,
                toDateTime(:start),
                toDateTime(:end)
              )
            )
          )`,
          params
        )
      );
    });
  }

  /**
   * Create the time series query for a single event
   */
  getEventQuery(event: EventFilter) {
    const params = {
      unit: this.config.aggregateTimeUnit,
      name: event.name,
    };
    return knex("timescale")
      .select(
        "time",
        knex.raw(`:name as event`, params),
        knex.raw("CAST(count(*) as INTEGER) as count")
      )
      .leftJoin(
        "event",
        "timescale.time",
        knex.raw(`dateTrunc(:unit, event.timestamp)`, params)
      )
      .where("event.name", event.name)
      .groupBy("timescale.time")
      .orderBy("timescale.time");
  }

  /**
   * Build the query
   */
  createQuery() {
    this.sqlQuery = knex.queryBuilder<QueryResponse>();
    this.createTimescaleTable();

    const eventQueries = this.config.events.map((eventQuery) =>
      this.getEventQuery(eventQuery)
    );
    this.sqlQuery
      .with("all_data", (q) => {
        q.unionAll(eventQueries);
      })
      .select("event as name", "time", "count")
      .from("all_data");
  }

  /**
   * Run the query and return the results
   */
  async run(): Promise<TimeSeriesEvents> {
    // Get data and aggregate it by event
    this.createQuery();
    const rows = await this.sqlQuery;

    const results = new Map<string, TimeSeriesEventItem>();
    rows.forEach(({ name, time, count }) => {
      let eventData = results.get(name);
      if (!eventData) {
        eventData = {
          name,
          data: [],
        };
      }

      eventData.data.push({ time, count });
      results.set(name, eventData);
    });

    return Array.from(results.values());
  }
}
