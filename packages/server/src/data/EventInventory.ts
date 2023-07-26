import { clickhouse } from "../lib/clickhouse";

export type EventInventoryRow = {
  /** Event name */
  name: string;

  /** Last time this event was used */
  timestamp?: number;
};

/**
 * The event inventory contains a list of all the unique events and the last time they were used.
 * This is primarily here as a quick way to lookup events, or determine how to truncate the
 * data.
 */
export const EventInventory = {
  /**
   * Insert inventory rows
   */
  async insert(rows: EventInventoryRow[]) {
    await clickhouse.insert({
      table: "event_inventory",
      values: rows,
      format: "JSONEachRow",
    });
  },
};
