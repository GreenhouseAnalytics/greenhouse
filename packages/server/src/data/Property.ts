import { clickhouse } from "../lib/clickhouse";

export enum PropFor {
  EVENT = "event",
  USER = "user",
}

export const ValidPropDataTypes = [
  "String",
  "Boolean",
  "Float64",
  "DateTime",
] as const;
export type ValidPropDataType = (typeof ValidPropDataTypes)[number];

export type PropValue = string | number | boolean;

export type PropertyRecord = {
  name: string;
  for: PropFor;
  column: string;
  timestamp: number;
};

export type PropertyRow = {
  name: string;
  for: PropFor;
  column: string;
  timestamp?: number;
};

export const PROPERTY_PREFIX = "p";

/**
 * Data model for the property table
 */
export const Property = {
  /**
   * Get all property definitions for a particular type
   */
  getProps(propFor: PropFor) {
    return clickhouse
      .query({
        query_params: { propFor },
        query: `
          SELECT
            name,
            for,
            column
          FROM property
          WHERE for = {propFor: String}
        `,
        format: "JSONEachRow",
      })
      .then((result) => result.json<PropertyRecord[]>());
  },

  /**
   * Create new property definitions
   */
  async create(rows: PropertyRow[]) {
    await clickhouse.insert({
      table: "property",
      values: rows,
      format: "JSONEachRow",
    });
  },

  /**
   * Define property columns on target table (i.e. event or user)
   */
  async addPropColumns(onTable: PropFor, cols: Map<string, ValidPropDataType>) {
    const colQueries = [...cols.keys()]
      .map((name) => {
        const type = cols.get(name);
        return [
          `MODIFY COLUMN IF EXISTS "${name}" Nullable(${type}) DEFAULT NULL`,
          `ADD COLUMN IF NOT EXISTS "${name}" Nullable(${type}) DEFAULT NULL`,
        ].join(",\n");
      })
      .join(",\n");

    const query = `ALTER TABLE ${onTable}\n${colQueries}`;
    await clickhouse.command({
      query,
      clickhouse_settings: {
        wait_end_of_query: 1,
      },
    });
  },
};
