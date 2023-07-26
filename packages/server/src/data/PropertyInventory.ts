import { clickhouse } from "../lib/clickhouse";

export type PropertyInventoryRow = {
  /** Full property name (not column name) */
  name: string;

  /** What record type this property is on */
  for: "event" | "user";

  /** Which event the property was used on, if applicable */
  event?: string;

  /** Last time this property was used */
  timestamp?: number;
};

/**
 * The property inventory contains a list of all the unique properties and the last time they were used.
 * This is primarily here as a quick way to lookup events, or determine how to truncate the data.
 * The uniqueness is determined by the combination of name, for, and event values.
 */
export const PropertyInventory = {
  /**
   * Insert inventory rows
   */
  async insert(rows: PropertyInventoryRow[]) {
    await clickhouse.insert({
      table: "property_inventory",
      values: rows,
      format: "JSONEachRow",
    });
  },
};
