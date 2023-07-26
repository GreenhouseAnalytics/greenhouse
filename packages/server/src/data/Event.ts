import { clickhouse } from "../lib/clickhouse";

export type EventRow = {
  name: string;
  user_alias_id: string;
  timestamp: number;
  [key: string]: string | number | boolean;
};

/**
 * Data model for events
 */
export const Event = {
  /**
   * Insert an event into the table
   */
  insert(eventRows: EventRow[]) {
    return clickhouse.insert({
      table: "event",
      values: eventRows,
      format: "JSONEachRow",
    });
  },

  /**
   * Describe the DB table
   */
  async describe() {
    return clickhouse
      .query({ query: `DESCRIBE event` })
      .then((resultSet) =>
        resultSet.json<{ data: { name: string; type: string }[] }>()
      )
      .then((results) =>
        results.data.map((row) => ({ name: row.name, type: row.type }))
      );
  },
};
