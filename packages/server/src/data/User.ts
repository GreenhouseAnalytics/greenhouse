import { v4 as uuid } from "uuid";
import { clickhouse } from "../lib/clickhouse";

export type UserRecord = {
  /** The internal user ID */
  id: string;

  /** The alias used when looking up this user. */
  alias_id?: string;

  created_at?: number;
  updated_at?: number;
  is_deleted?: number;

  /** User properties */
  [key: string]: string | number | boolean | null | undefined;
};

/**
 * Data model for a user record
 */
export const User = {
  /**
   * Get user records by alias IDs
   */
  async getByAliases(ids: string[]): Promise<UserRecord[]> {
    return clickhouse
      .query({
        query_params: { ids },
        query: `
          SELECT
            DISTINCT ON (user.id)
            user.*,
            user_alias.id as alias_id
          FROM user
          JOIN user_alias ON user_alias.user_id = user.id
          WHERE
            user_alias.alias in ({ids: Array(String)})
            AND user.is_deleted = 0
          ORDER BY updated_at DESC
        `,
        format: "JSONEachRow",
      })
      .then((result) => result.json<UserRecord[]>());
  },

  /**
   * Get user record by ID or alias ID
   */
  async getByAlias(alias: string): Promise<UserRecord> {
    return this.getByAliases([alias]).then((list) => list[0]);
  },

  /**
   * Create new user record
   */
  async create() {
    const id = uuid();
    await clickhouse.insert({
      table: "user",
      values: [{ id }],
      format: "JSONEachRow",
    });
    return id;
  },

  /**
   * Set properties on user object
   */
  async update(data: UserRecord) {
    const now = Math.round(Date.now() / 1000);
    await clickhouse.insert({
      table: "user",
      values: [{ ...data, updated_at: now }],
      format: "JSONEachRow",
    });
  },

  /**
   * Delete a user record by ID
   */
  async delete(id: string) {
    await clickhouse.insert({
      table: "user",
      values: [{ id, is_deleted: 1 }],
      format: "JSONEachRow",
    });
  },

  /**
   * Describe the DB table
   */
  async describe() {
    return clickhouse
      .query({ query: `DESCRIBE user` })
      .then((resultSet) =>
        resultSet.json<{ data: { name: string; type: string }[] }>()
      )
      .then((results) =>
        results.data.map((row) => ({ name: row.name, type: row.type }))
      );
  },

  /**
   * Set the update time on a list of user properties
   */
  async setPropertyTimes(userId: string, properties: string[]) {
    await clickhouse.insert({
      table: "user_property_time",
      values: properties.map((property) => ({ user_id: userId, property })),
      format: "JSONEachRow",
    });
  },

  /**
   * Return the most recent properties from two user records.
   * This is used when merging two user records
   */
  async mostRecentUserProperties(userIdA: string, userIdB: string) {
    return clickhouse
      .query({
        query_params: { userIdA, userIdB },
        query: `
          SELECT
            DISTINCT ON (property)
            user_id,
            property
          FROM user_property_time
          WHERE user_id IN ({userIdA: UUID}, {userIdB: UUID})
          ORDER BY timestamp DESC
        `,
        format: "JSONEachRow",
      })
      .then((resultSet) => {
        return resultSet.json<{ user_id: string; property: string }[]>();
      });
  },
};
