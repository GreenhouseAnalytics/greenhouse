import "jest";
import { v4 as uuid } from "uuid";

import { UserRecord } from "../data/User";
import { Event } from "../data/Event";
import { PROPERTY_PREFIX, PropFor } from "../data/Property";
import { PropertyService } from "./PropertyService";
import { UserService } from "./UserService";
import { EventService, EventPayload } from "./EventService";

describe("EventService", () => {
  describe("create", () => {
    let user: UserRecord;

    beforeEach(() => {
      user = {
        id: uuid(),
        alias_id: "alias",
      };
      jest.spyOn(UserService, "getOrCreate").mockResolvedValue(user);
      jest.spyOn(PropertyService, "updatePropColumns").mockResolvedValue(
        new Map([
          ["foo", { name: `${PROPERTY_PREFIX}_foo`, type: "String" }],
          ["bar", { name: `${PROPERTY_PREFIX}_bar`, type: "String" }],
        ])
      );
      Event.insert = jest.fn();
    });

    test("add event and properties", async () => {
      await EventService.create({
        userId: "alias",
        events: [{ name: "test.event", props: { foo: "fuz" }, time: 1 }],
      });

      expect(Event.insert).toBeCalledWith([
        {
          time: expect.anything(),
          event: "test.event",
          user_alias_id: user.alias_id,
          [`${PROPERTY_PREFIX}_foo`]: "fuz",
        },
      ]);
    });

    test("define property columns", async () => {
      await EventService.create({
        userId: "alias",
        events: [{ name: "test.event", props: { foo: "fuz" }, time: 1 }],
      });

      expect(PropertyService.updatePropColumns).toBeCalledWith(PropFor.EVENT, [
        ["foo", "fuz"],
      ]);
    });

    test("drop null value properties", async () => {
      await EventService.create({
        time: 0,
        userId: "alias",
        events: [{ name: "test.event", props: { foo: null }, time: 1 }],
      } as unknown as EventPayload);
      expect(Event.insert).toBeCalledWith([
        {
          time: expect.anything(),
          event: "test.event",
          user_alias_id: user.alias_id,
        },
      ]);
    });

    test("drop undefined value properties", async () => {
      await EventService.create({
        time: 0,
        userId: "alias",
        events: [{ name: "test.event", props: { foo: undefined }, time: 1 }],
      } as unknown as EventPayload);
      expect(Event.insert).toBeCalledWith([
        {
          time: expect.anything(),
          event: "test.event",
          user_alias_id: user.alias_id,
        },
      ]);
    });
  });
});
