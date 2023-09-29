/**
 * Event time series query
 */
export type TimeSeriesQuery = {
  events: {
    name: string;
  }[];
  timeWindow: TimeWindowFixed | TimeWindowRelative;
  aggregateTimeUnit: TimeUnit;
};

export type EventFilter = {
  name: string;
};

type TimeUnit = "hour" | "day" | "week" | "month";

/**
 * A fixed time range from a start/end date
 */
type TimeWindowFixed = {
  type: "fixed";
  start: string;
  end: string;
};

/**
 * A date range that is based on how many "days ago" a thing was.
 */
type TimeWindowRelative = {
  type: "relative";
  start: number;
  end?: number;
  unit: TimeUnit;
};

/**
 * API Response
 */
export type TimeSeriesQueryResponse = {
  events: TimeSeriesEvents;
  scale: string[];
};
export type TimeSeriesEvents = TimeSeriesEventItem[];
export type TimeSeriesEventItem = {
  name: string;
  data: {
    time: string;
    count: number;
  }[];
};
