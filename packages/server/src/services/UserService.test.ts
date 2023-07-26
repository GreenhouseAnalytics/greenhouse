import "jest";
import { v4 as uuid } from "uuid";
import { User, UserRecord } from "../data/User";
import { UserPropertyTime } from "../data/UserPropertyTime";
import { UserAlias, AliasRecord } from "../data/UserAlias";
import { PropertyInventory } from "../data/PropertyInventory";
import { PropFor, PROPERTY_PREFIX } from "../data/Property";
import { PropertyService } from "./PropertyService";
import { UserService } from "./UserService";

describe("UserService", () => {
  describe("getOrCreate", () => {
    beforeEach(async () => {
      User.getByAlias = jest.fn().mockResolvedValue(undefined);
      UserAlias.create = jest.fn();
      User.create = jest.fn();
    });

    test("return existing user", async () => {
      const id = uuid();
      User.getByAlias = jest.fn().mockImplementation((alias_id: string) => ({
        id,
        alias_id,
      }));

      const user = await UserService.getOrCreate("user-id");
      expect(user.id).toBe(id);
      expect(User.create).not.toBeCalled();
    });

    test("create new user", async () => {
      let createdId: string;
      User.create = jest.fn().mockImplementation(() => {
        createdId = uuid();
        return createdId;
      });
      // Return undefined until User.create is called
      User.getByAlias = jest.fn().mockImplementation(() => {
        if (createdId) {
          return {
            id: createdId,
            alias_id: "alias",
          };
        }
      });

      const user = await UserService.getOrCreate("user-id");
      expect(User.create).toBeCalled();
      expect(UserAlias.create).toBeCalledWith(expect.anything(), "user-id");
      expect(User.getByAlias).toBeCalledTimes(2);
      expect(user.id).toBeDefined();
    });
  });

  describe("alias", () => {
    let user: UserRecord;

    beforeEach(async () => {
      user = {
        id: uuid(),
        alias_id: "alias",
      };

      User.getByAlias = jest.fn().mockResolvedValue(undefined);
      UserAlias.get = jest.fn();
      UserAlias.create = jest.fn();
      User.create = jest.fn();

      jest.spyOn(UserService, "getOrCreate").mockResolvedValue(user);
      jest
        .spyOn(UserService, "merge")
        .mockResolvedValue({} as unknown as UserRecord);
    });

    test("create alias", async () => {
      await UserService.alias("userId", "alias");

      expect(UserService.getOrCreate).toBeCalledWith("userId");
      expect(UserAlias.get).toBeCalledWith("alias");
      expect(UserAlias.create).toBeCalledWith(user.id, "alias");
      expect(UserService.merge).not.toBeCalled();
    });

    test("merge users if the alias exists and is attached to another user", async () => {
      const alias: AliasRecord = {
        id: uuid(),
        user_id: uuid(),
        alias: "alias",
      };
      UserAlias.get = jest.fn().mockResolvedValue(alias);
      await UserService.alias("userId", "alias");

      expect(UserService.getOrCreate).toBeCalledWith("userId");
      expect(UserAlias.get).toBeCalledWith("alias");
      expect(UserAlias.create).toBeCalledWith(user.id, "alias");
      expect(UserService.merge).toBeCalledWith(user.id, alias.user_id);
    });
  });

  describe("setProperties", () => {
    let user: UserRecord;
    let updatePropColumnsFn: jest.SpyInstance;

    beforeEach(async () => {
      user = {
        id: uuid(),
        alias_id: "alias",
      };

      User.update = jest.fn();
      UserPropertyTime.setPropertyTimes = jest.fn();

      jest.spyOn(UserService, "getOrCreate").mockResolvedValue(user);
      jest.spyOn(PropertyInventory, "insert").mockResolvedValue(null as never);
      updatePropColumnsFn = jest
        .spyOn(PropertyService, "updatePropColumns")
        .mockResolvedValue(new Map());
    });

    test("create prop columns and update user and prop times", async () => {
      updatePropColumnsFn.mockResolvedValue(
        new Map([["foo", { name: `${PROPERTY_PREFIX}_foo`, type: "String" }]])
      );

      await UserService.setProperties(user.id, { foo: "bar" }, "normal");

      expect(updatePropColumnsFn).toBeCalledWith(PropFor.USER, [
        ["foo", "bar"],
      ]);
      expect(User.update).toBeCalledWith({
        ...user,
        p_foo: "bar",
      });
      expect(UserPropertyTime.setPropertyTimes).toBeCalledWith(user.id, [
        ["p_foo", "normal"],
      ]);
    });

    test("add props to inventory", async () => {
      updatePropColumnsFn.mockResolvedValue(
        new Map([
          ["foo", { name: `${PROPERTY_PREFIX}_foo`, type: "String" }],
          ["boo", { name: `${PROPERTY_PREFIX}_boo`, type: "String" }],
        ])
      );

      await UserService.setProperties(
        user.id,
        { foo: "bar", boo: "baz" },
        "normal"
      );

      expect(PropertyInventory.insert).toBeCalledWith([
        { name: "foo", for: "user" },
        { name: "boo", for: "user" },
      ]);
    });
  });

  describe("incrementProperty", () => {
    let user: UserRecord;

    beforeEach(async () => {
      user = {
        id: uuid(),
        alias_id: "alias",
        name: "John",
        p_views: 1,
        p_foo: "bar",
      };

      User.update = jest.fn();
      UserPropertyTime.setPropertyTimes = jest.fn();

      jest.spyOn(UserService, "getOrCreate").mockResolvedValue(user);
      jest.spyOn(PropertyService, "updatePropColumns").mockResolvedValue(
        new Map([
          ["views", { name: `${PROPERTY_PREFIX}_views`, type: "Float64" }],
          ["foo", { name: `${PROPERTY_PREFIX}_foo`, type: "String" }],
        ])
      );
    });

    test("increment existing value", async () => {
      await UserService.incrementProperty(user.id, "views");
      expect(User.update).toBeCalledWith(
        expect.objectContaining({
          id: user.id,
          p_views: 2,
        })
      );
    });

    test("create a new column to increment", async () => {
      jest
        .spyOn(PropertyService, "updatePropColumns")
        .mockResolvedValue(
          new Map([
            [
              "unknown",
              { name: `${PROPERTY_PREFIX}_unknown`, type: "Float64" },
            ],
          ])
        );

      await UserService.incrementProperty(user.id, "unknown");
      expect(User.update).toBeCalledWith(
        expect.objectContaining({
          id: user.id,
          p_unknown: 1,
        })
      );
    });

    test("do not increment if property is not a number", async () => {
      await UserService.incrementProperty(user.id, "foo");
      expect(User.update).not.toBeCalled();
    });

    test("increment if we can coerce the value into a number", async () => {
      user.p_foo = "5";
      await UserService.incrementProperty(user.id, "foo");
      expect(User.update).toBeCalledWith(
        expect.objectContaining({
          id: user.id,
          p_foo: "6",
        })
      );
    });
  });

  describe("merge", () => {
    let userA: UserRecord;
    let userB: UserRecord;

    beforeEach(async () => {
      userA = {
        id: uuid(),
        alias_id: "aliasA",
      };
      userB = {
        id: uuid(),
        alias_id: "aliasB",
      };

      User.getByAliases = jest.fn();
      User.update = jest.fn();
      User.delete = jest.fn();
      UserAlias.update = jest.fn();
      UserAlias.getForUser = jest.fn().mockResolvedValue([]);
      UserPropertyTime.getForUsers = jest.fn().mockResolvedValue([]);
      UserPropertyTime.setPropertyTimes = jest.fn();
    });

    test("if A & B alias to the same user, there is nothing to merge", async () => {
      User.getByAliases = jest.fn().mockResolvedValue([userA]);
      const result = await UserService.merge(
        userA.alias_id as string,
        userB.alias_id as string
      );
      expect(result.id).toBe(userA.id);
      expect(User.update).not.toBeCalled();
    });

    test("merge the more recent property values", async () => {
      userA = {
        ...userA,
        p_foo: "bar", // timestamp 1
        p_boo: true, // timestamp 2 (keep)
      };
      userB = {
        ...userB,
        p_foo: "woo", // timestamp 2 (keep)
        p_boo: false, // timestamp 1
      };

      User.getByAliases = jest.fn().mockResolvedValue([userA, userB]);
      UserPropertyTime.getForUsers = jest.fn().mockResolvedValue([
        { property: "p_foo", user_id: userA.id, timestamp: 1 },
        { property: "p_foo", user_id: userB.id, timestamp: 2 },
        { property: "p_boo", user_id: userA.id, timestamp: 2 },
        { property: "p_boo", user_id: userB.id, timestamp: 1 },
      ]);

      const result = await UserService.merge(
        userA.alias_id as string,
        userB.alias_id as string
      );
      expect(result.p_foo).toEqual("woo");
      expect(result.p_boo).toEqual(true);
    });

    test("if only one user has the property, use that", async () => {
      userA = {
        ...userA,
        p_foo: "bar",
      };
      userB = {
        ...userB,
      };

      User.getByAliases = jest.fn().mockResolvedValue([userA, userB]);
      UserPropertyTime.getForUsers = jest
        .fn()
        .mockResolvedValue([
          { property: "p_foo", user_id: userA.id, timestamp: 1 },
        ]);

      const result = await UserService.merge(
        userA.alias_id as string,
        userB.alias_id as string
      );
      expect(result.p_foo).toEqual("bar");
    });

    test("sort A/B and merge into the older record and delete the younger record", async () => {
      userA = { ...userA, created_at: Date.now() };
      userB = { ...userB, created_at: Date.now() - 100 }; // B is older

      User.getByAliases = jest.fn().mockResolvedValue([userA, userB]);
      const result = await UserService.merge(userA.id, userB.id);

      expect(result.id).toBe(userB.id);
      expect(User.delete).toBeCalledWith(userA.id);
      expect(User.update).toBeCalledWith(
        expect.objectContaining({
          id: userB.id,
        })
      );
    });

    test("reassociate aliases from the user that will be deleted", async () => {
      userA = { ...userA, created_at: Date.now() };
      userB = { ...userB, created_at: Date.now() - 100 }; // B is older

      UserAlias.getForUser = jest
        .fn()
        .mockResolvedValue([{ id: "", user_id: "", alias: "alias" }]);
      User.getByAliases = jest.fn().mockResolvedValue([userA, userB]);

      await UserService.merge(userA.id, userB.id);
      expect(User.delete).toBeCalledWith(userA.id);
      expect(UserAlias.update).toBeCalledWith([
        { id: "", user_id: userB.id, alias: "alias" },
      ]);
    });

    test("merge built-in props", async () => {
      userA = {
        ...userA,
        name: "John",
      };
      userB = {
        ...userB,
        name: "Joann",
      };

      User.getByAliases = jest.fn().mockResolvedValue([userA, userB]);
      UserPropertyTime.getForUsers = jest.fn().mockResolvedValue([
        { property: "name", user_id: userA.id, timestamp: 1, type: "normal" },
        { property: "name", user_id: userB.id, timestamp: 2, type: "normal" },
      ]);

      const result = await UserService.merge(
        userA.alias_id as string,
        userB.alias_id as string
      );
      expect(result.name).toEqual("Joann");
      expect(UserPropertyTime.setPropertyTimes).toBeCalledWith(userA.id, [
        ["name", "normal"],
      ]);
    });

    describe("type: once", () => {
      test("if both are type once, take the older value", async () => {
        userA = {
          ...userA,
          p_foo: "bar",
        };
        userB = {
          ...userB,
          p_foo: "woo",
        };

        User.getByAliases = jest.fn().mockResolvedValue([userA, userB]);
        UserPropertyTime.getForUsers = jest.fn().mockResolvedValue([
          {
            property: "p_foo",
            user_id: userA.id,
            timestamp: 1,
            type: "once",
          },
          {
            property: "p_foo",
            user_id: userB.id,
            timestamp: 2,
            type: "once",
          },
        ]);

        const result = await UserService.merge(
          userA.alias_id as string,
          userB.alias_id as string
        );
        expect(result.p_foo).toEqual("bar");
        expect(UserPropertyTime.setPropertyTimes).toBeCalledWith(userA.id, [
          ["p_foo", "once"],
        ]);
      });

      test("if both are not type once, take the newer value", async () => {
        userA = {
          ...userA,
          p_foo: "older",
        };
        userB = {
          ...userB,
          p_foo: "newer",
        };

        User.getByAliases = jest.fn().mockResolvedValue([userA, userB]);
        UserPropertyTime.getForUsers = jest.fn().mockResolvedValue([
          {
            property: "p_foo",
            user_id: userA.id,
            timestamp: 1,
            type: "once",
          },
          {
            property: "p_foo",
            user_id: userB.id,
            timestamp: 2,
            type: "normal",
          },
        ]);

        const result = await UserService.merge(
          userA.alias_id as string,
          userB.alias_id as string
        );
        expect(result.p_foo).toEqual("newer");
        expect(UserPropertyTime.setPropertyTimes).toBeCalledWith(userA.id, [
          ["p_foo", "normal"],
        ]);
      });
    });
  });
});
