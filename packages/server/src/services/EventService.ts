import { Event, EventRow } from "../data/Event";
import { PropFor, PropValue } from "../data/Property";
import { EventInventory, EventInventoryRow } from "../data/EventInventory";
import {
  PropertyInventory,
  PropertyInventoryRow,
} from "../data/PropertyInventory";
import { UserService } from "./UserService";
import { PropertyService } from "./PropertyService";

export type EventProps = Record<string, PropValue>;

export type EventItem = {
  name: string;
  props: EventProps;
  time: number;
};

export type EventPayload = {
  userId: string;
  events: EventItem[];
};

export class EventService {
  /**
   * Add one or more events into the system
   */
  static async create(payload: EventPayload) {
    // Create user, if necessary
    const user = await UserService.getOrCreate(payload.userId);

    // Create new event property columns
    let propEntries: [string, unknown][] = [];
    payload.events.forEach((event) => {
      propEntries = propEntries.concat(Object.entries(event.props ?? {}));
    });
    const propColumnMap = await PropertyService.updatePropColumns(
      PropFor.EVENT,
      propEntries
    );

    // Create insert data
    const eventInventory: EventInventoryRow[] = [];
    const propInventory = new Map<string, PropertyInventoryRow>();
    const rows = payload.events.map((event) => {
      // Remap prop name to DB column name
      const props = Object.entries(event.props || {}).reduce<
        Record<string, PropValue | null>
      >((prev, [name, value]) => {
        const col = propColumnMap.get(name);
        if (
          typeof col !== "undefined" &&
          value !== null &&
          typeof value !== "undefined"
        ) {
          prev[col.name] = PropertyService.castType(value, col.type);
          propInventory.set(`${name}:${event.name}`, {
            name,
            for: "event",
            event: event.name,
          } as PropertyInventoryRow);
        }
        return prev;
      }, {});

      eventInventory.push({ name: event.name } as EventInventoryRow);
      return {
        ...props,
        name: event.name,
        user_alias_id: user.alias_id,
        timestamp: event.time,
      } as EventRow;
    });

    // Add data to DB
    await Promise.all([
      Event.insert(rows),
      EventInventory.insert(eventInventory),
      PropertyInventory.insert(Array.from(propInventory.values())),
    ]);
  }
}
