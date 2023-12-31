import { User, UserRecord } from "../data/User";
import {
  UserPropertyTime,
  UserPropertyTypeRecord,
  UserPropertySetType,
} from "../data/UserPropertyTime";
import {
  PropertyInventory,
  PropertyInventoryRow,
} from "../data/PropertyInventory";
import { UserAlias } from "../data/UserAlias";
import { PropFor, PropValue } from "../data/Property";
import logger from "../logger";
import { PropertyService } from "./PropertyService";

/**
 * Manages users
 */
export const UserService = {
  /**
   * Get or create user with ID.
   */
  async getOrCreate(id: string): Promise<UserRecord> {
    const existing = await User.getByAlias(id);

    // Return existing ID
    if (existing) {
      return existing;
    }

    // Create new user and alias this ID to it
    const userId = await User.create();
    await UserAlias.create(userId, id);
    return User.getByAlias(id);
  },

  /**
   * Create an alias to a user.
   * Aliases are how we identify users externally.
   * An alias can be an system user ID, an email address, etc.
   * @param userId - The user ID or previous alias ID
   * @param alias - The new value to alias to this user
   */
  async alias(userId: string, alias: string) {
    const user = await this.getOrCreate(userId);
    const existing = await UserAlias.get(alias);

    // Create alias
    await UserAlias.create(user.id, alias);

    // Merge users
    if (existing && user.id !== existing.user_id) {
      await this.merge(user.id, existing.user_id);
    }
  },

  /**
   * Set properties on the user record
   */
  async setProperties(
    userId: string,
    props: Record<string, PropValue>,
    type: UserPropertySetType
  ) {
    const user = await this.getOrCreate(userId);
    const propItems = Object.entries(props);

    // Create prop columns, if necessary
    const propColumnMap = await PropertyService.updatePropColumns(
      PropFor.USER,
      propItems
    );

    // Remap props to DB columns
    const propInventory: PropertyInventoryRow[] = [];
    const propData = propItems.reduce((prev, [name, value]) => {
      const col = propColumnMap.get(name);
      if (typeof col !== "undefined") {
        prev[col.name] = PropertyService.castType(value, col.type);
        propInventory.push({
          name,
          for: "user",
        });
      }
      return prev;
    }, {} as UserRecord);

    // User property data
    const update = { ...user, ...propData };
    const propSetValues = Object.keys(propData).map<
      [string, UserPropertySetType]
    >((name) => [name, type]);

    // Save data
    await Promise.all([
      User.update(update),
      UserPropertyTime.setPropertyTimes(user.id, propSetValues),
      PropertyInventory.insert(propInventory),
    ]);
  },

  /**
   * Increment a numeric property
   */
  async incrementProperty(userId: string, property: string) {
    const user = await this.getOrCreate(userId);

    // Get column
    const propColumnMap = await PropertyService.updatePropColumns(
      PropFor.USER,
      [[property, 1]]
    );
    const column = propColumnMap.get(property);
    const propData: Partial<UserRecord> = {};
    if (!column) {
      logger.warn(
        `Cannot increment User property ${property}. DB column not found.`
      );
      return;
    }

    // Get value and attempt to coerce it into a number, if necessary
    let currVal = user[column.name] || 0;
    if (typeof currVal !== "number") {
      currVal = Number(currVal);
    }
    if (isNaN(currVal)) {
      logger.warn(
        `Cannot increment User property ${property}. It is not a number`
      );
      return;
    }

    // Update DB
    propData[column.name] = PropertyService.castType(currVal + 1, column.type);
    const update = { ...user, ...propData };
    await Promise.all([
      User.update(update),
      UserPropertyTime.setPropertyTimes(user.id, [[column.name, "normal"]]),
    ]);
  },

  /**
   * Merge user records
   * @param userA - The ID or alias to a user
   * @param userB - The ID or alias to a user
   */
  async merge(userA: string, userB: string) {
    const users = await User.getByAliases([userA, userB]);

    // If both IDs belong to the same user, no need to merge.
    // This can happen even if both IDs are different, because
    // the IDs are aliased to the same user.
    if (users.length == 1) {
      return users[0];
    }

    // Ensure user A is the older record
    users.sort(
      (a: UserRecord, b: UserRecord) =>
        (a.created_at ?? 0) - (b.created_at ?? 0)
    );
    const userIdA = users[0].id;
    const userIdB = users[1].id;

    const userMap: Record<string, UserRecord> = {};
    users.forEach((user) => (userMap[user.id] = user));

    // Get property update times for users
    const propTimes = await UserPropertyTime.getForUsers([userIdA, userIdB]);
    const propForUser: Record<
      string,
      Record<string, UserPropertyTypeRecord>
    > = { [userIdA]: {}, [userIdB]: {} };
    const mergeProps = new Set<string>([]);
    propTimes.forEach((prop) => {
      mergeProps.add(prop.property);
      propForUser[prop.user_id] = propForUser[prop.user_id] ?? {};
      propForUser[prop.user_id][prop.property] = prop;
    });

    // Merge properties
    const merged: Partial<UserRecord> = {};
    const propTimeValues: [string, UserPropertySetType][] = [];
    for (const prop of mergeProps) {
      const propA = propForUser[userIdA][prop];
      const propB = propForUser[userIdB][prop];
      const all = [propA, propB].filter((i) => !!i);

      // Sort by timestamp, with most recent first
      const recentFirst = [propA, propB].sort(
        (a, b) => b.timestamp - a.timestamp
      );

      let propRecord;

      // Only exists in one user
      if (all.length === 1) {
        propRecord = all[0];
      }
      // Both are marked as once, so take the oldest value
      else if (propA.type === "once" && propB.type === "once") {
        propRecord = recentFirst[1];
      }
      // Otherwise take the most recent value
      else {
        propRecord = recentFirst[0];
      }

      if (propRecord) {
        propTimeValues.push([prop, propRecord.type]);
        merged[prop] = userMap[propRecord.user_id][prop];
      }
    }

    // Update user A data
    const mergedData: UserRecord = {
      ...userMap[userIdA],
      ...merged,
    };

    // Reassociate all User B aliases to A
    const aliases = await UserAlias.getForUser(userIdB);
    const aliasUpdates = aliases.map((item) => ({
      ...item,
      user_id: userIdA,
    }));

    // Run queries
    await Promise.all([
      User.update(mergedData),
      User.delete(userIdB),
      UserAlias.update(aliasUpdates),
      UserPropertyTime.setPropertyTimes(userIdA, propTimeValues),
    ]);
    return mergedData;
  },
};
