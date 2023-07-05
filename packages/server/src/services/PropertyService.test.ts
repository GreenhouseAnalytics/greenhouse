import "jest";
import { Event } from "../data/Event";
import { User } from "../data/User";
import { Property, PropFor, PROPERTY_PREFIX } from "../data/Property";
import { LocalCache } from "../cache";
import { PropertyService } from "./PropertyService";

describe("PropertyService", () => {
  let cacheHasFn: jest.SpyInstance;
  let cacheGetFn: jest.SpyInstance;
  let cacheRemoveFn: jest.SpyInstance;

  beforeEach(() => {
    // Disable cache
    cacheHasFn = jest
      .spyOn(LocalCache.prototype, "has")
      .mockImplementation((_: string) => Promise.resolve(false));
    cacheGetFn = jest
      .spyOn(LocalCache.prototype, "get")
      .mockImplementation((_: string) => Promise.resolve());
    cacheRemoveFn = jest
      .spyOn(LocalCache.prototype, "remove")
      .mockResolvedValue();
  });

  describe("convert2ColumnName", () => {
    test("add property prefix", () => {
      const result = PropertyService.convert2ColumnName("foo", []);
      expect(result).toBe(`${PROPERTY_PREFIX}_foo`);
    });

    test("remove leading/trailing spaces", () => {
      const result = PropertyService.convert2ColumnName("  foo  ", []);
      expect(result).toBe(`${PROPERTY_PREFIX}_foo`);
    });

    test("remove non-alphanumeric characters", () => {
      const result = PropertyService.convert2ColumnName("foo!$bar", []);
      expect(result).toBe(`${PROPERTY_PREFIX}_foobar`);
    });

    test("replace dots, dashes, and spaces with underscores", () => {
      const result = PropertyService.convert2ColumnName(
        "hello world.good-bye",
        []
      );
      expect(result).toBe(`${PROPERTY_PREFIX}_hello_world_good_bye`);
    });

    test("keep underscores", () => {
      const result = PropertyService.convert2ColumnName("foo_bar", []);
      expect(result).toBe(`${PROPERTY_PREFIX}_foo_bar`);
    });

    test("remove consecutive underscores", () => {
      const result = PropertyService.convert2ColumnName("foo__bar", []);
      expect(result).toBe(`${PROPERTY_PREFIX}_foo_bar`);
    });

    test("make lowercase", () => {
      const result = PropertyService.convert2ColumnName("FOO", []);
      expect(result).toBe(`${PROPERTY_PREFIX}_foo`);
    });

    test("less than 30 characters", () => {
      const result = PropertyService.convert2ColumnName(
        "123456789012345678901234567890123",
        []
      );
      expect(result).toBe(`${PROPERTY_PREFIX}_123456789012345678901234567890`);
    });

    test("ensure the column is unix with prefix", () => {
      const result = PropertyService.convert2ColumnName("foo", [
        `${PROPERTY_PREFIX}_foo`,
        `${PROPERTY_PREFIX}_foo1`,
      ]);
      expect(result).toBe(`${PROPERTY_PREFIX}_foo2`);
    });

    test("convert camelCase to snake_case", () => {
      const result = PropertyService.convert2ColumnName(
        "hello_worldGoodByeNOW",
        []
      );
      expect(result).toBe("p_hello_world_good_bye_now");
    });
  });

  describe("expandDataType", () => {
    test("from boolean to number", () => {
      const result = PropertyService.expandDataType("Float64", "Boolean");
      expect(result).toBe("Float64");
    });

    test("from number to boolean", () => {
      const result = PropertyService.expandDataType("Boolean", "Float64");
      expect(result).toBe("Float64");
    });

    test("from number to DateTime", () => {
      const result = PropertyService.expandDataType("DateTime", "Float64");
      expect(result).toBe("String");
    });

    test("from DateTime to boolean", () => {
      const result = PropertyService.expandDataType("Boolean", "DateTime");
      expect(result).toBe("String");
    });

    test("from and to match", () => {
      const result = PropertyService.expandDataType("Boolean", "Boolean");
      expect(result).toBe("Boolean");
    });
  });

  describe("getTableModel", () => {
    test("event", () => {
      const result = PropertyService.getTableModel(PropFor.EVENT);
      expect(result).toBe(Event);
    });

    test("user", () => {
      const result = PropertyService.getTableModel(PropFor.USER);
      expect(result).toBe(User);
    });

    test("unknown", () => {
      const result = PropertyService.getTableModel(
        "unknown" as unknown as PropFor
      );
      expect(result).toBe(null);
    });
  });

  describe("updatePropColumns", () => {
    beforeEach(() => {
      Property.create = jest.fn().mockResolvedValue(null);
      Property.addPropColumns = jest.fn().mockResolvedValue(null);

      jest.spyOn(PropertyService, "getTablePropColumns").mockResolvedValue({
        [`${PROPERTY_PREFIX}_prop`]: "Boolean",
      });
      jest
        .spyOn(PropertyService, "getPropertyDefinitionList")
        .mockResolvedValue([
          {
            name: "prop",
            column: `${PROPERTY_PREFIX}_prop`,
            for: PropFor.EVENT,
            timestamp: 1,
          },
        ]);
    });

    test("create new column & mapping", async () => {
      await PropertyService.updatePropColumns(PropFor.EVENT, [
        ["new_prop", "value"],
      ]);
      expect(Property.create).toBeCalledWith([
        expect.objectContaining({
          name: "new_prop",
          column: `${PROPERTY_PREFIX}_new_prop`,
          for: PropFor.EVENT,
        }),
      ]);
      expect(Property.addPropColumns).toBeCalledWith(
        PropFor.EVENT,
        new Map([[`${PROPERTY_PREFIX}_new_prop`, "String"]])
      );
    });

    test("column already exists", async () => {
      await PropertyService.updatePropColumns(PropFor.EVENT, [["prop", true]]);
      expect(Property.create).not.toBeCalled();
      expect(Property.addPropColumns).not.toBeCalled();
    });

    test("case insensitive matching", async () => {
      await PropertyService.updatePropColumns(PropFor.EVENT, [["pRoP", true]]);
      expect(Property.create).not.toBeCalled();
      expect(Property.addPropColumns).not.toBeCalled();
    });

    test("expand the column data type", async () => {
      await PropertyService.updatePropColumns(PropFor.EVENT, [["prop", 123]]);
      expect(Property.create).not.toBeCalled();
      expect(Property.addPropColumns).toBeCalledWith(
        PropFor.EVENT,
        new Map([[`${PROPERTY_PREFIX}_prop`, "Float64"]])
      );
    });

    test("data type is already expanded for this type", async () => {
      jest.spyOn(PropertyService, "getTablePropColumns").mockResolvedValue({
        [`${PROPERTY_PREFIX}_prop`]: "String",
      });
      await PropertyService.updatePropColumns(PropFor.EVENT, [["prop", 123]]);
      expect(Property.create).not.toBeCalled();
      expect(Property.addPropColumns).not.toBeCalled();
    });

    test("mapping exists but column needs to be created", async () => {
      jest.spyOn(PropertyService, "getTablePropColumns").mockResolvedValue({});
      await PropertyService.updatePropColumns(PropFor.EVENT, [["prop", 123]]);
      expect(Property.create).not.toBeCalled();
      expect(Property.addPropColumns).toBeCalled();
    });

    test("clear cache after updating columns", async () => {
      await PropertyService.updatePropColumns(PropFor.EVENT, [
        ["new_prop", "value"],
      ]);
      expect(cacheRemoveFn).toBeCalled();
    });

    test("do not clear cache if no updates were necessary", async () => {
      await PropertyService.updatePropColumns(PropFor.EVENT, [["prop", true]]);
      expect(cacheRemoveFn).not.toBeCalled();
    });
  });

  describe("getTablePropColumns", () => {
    beforeEach(() => {
      Event.describe = jest
        .fn()
        .mockResolvedValue([
          { name: `${PROPERTY_PREFIX}_event_col`, type: "Nullable(String)" },
        ]);
      User.describe = jest
        .fn()
        .mockResolvedValue([
          { name: `${PROPERTY_PREFIX}_user_col`, type: "Nullable(String)" },
        ]);
    });

    test("event table", async () => {
      const result = await PropertyService.getTablePropColumns(PropFor.EVENT);
      expect(Event.describe).toBeCalled();
      expect(result).toEqual({ [`${PROPERTY_PREFIX}_event_col`]: "String" });
    });

    test("user table", async () => {
      const result = await PropertyService.getTablePropColumns(PropFor.USER);
      expect(User.describe).toBeCalled();
      expect(result).toEqual({ [`${PROPERTY_PREFIX}_user_col`]: "String" });
    });

    test("unknown table", async () => {
      const result = await PropertyService.getTablePropColumns(
        "unknown" as unknown as PropFor
      );
      expect(Event.describe).not.toBeCalled();
      expect(User.describe).not.toBeCalled();
      expect(result).toEqual({});
    });

    test("use cache", async () => {
      cacheHasFn.mockResolvedValue(true);
      cacheGetFn.mockResolvedValue(["cached_col"]);
      const result = await PropertyService.getTablePropColumns(PropFor.EVENT);
      expect(cacheGetFn).toBeCalledWith("event:columns");
      expect(Event.describe).not.toBeCalled();
      expect(result).toEqual(["cached_col"]);
    });

    test("unsupported data type", async () => {
      Event.describe = jest.fn().mockResolvedValue([
        { name: `${PROPERTY_PREFIX}_event_col`, type: "Nullable(String)" },
        { name: `${PROPERTY_PREFIX}_enum`, type: "Enum('foo', 'bar')" },
      ]);
      const result = await PropertyService.getTablePropColumns(PropFor.EVENT);
      expect(Event.describe).toBeCalled();
      expect(result).toEqual({ [`${PROPERTY_PREFIX}_event_col`]: "String" });
    });

    test("filter out non-property columns", async () => {
      Event.describe = jest.fn().mockResolvedValue([
        { name: `${PROPERTY_PREFIX}_event_col`, type: "Nullable(String)" },
        { name: `name`, type: "String" },
      ]);
      const result = await PropertyService.getTablePropColumns(PropFor.EVENT);
      expect(Event.describe).toBeCalled();
      expect(result).toEqual({ [`${PROPERTY_PREFIX}_event_col`]: "String" });
    });
  });

  describe("castType", () => {
    test("native boolean", () => {
      const result = PropertyService.castType(false, "Boolean");
      expect(result).toBe(false);
    });

    test("cast truthy number to boolean", () => {
      const result = PropertyService.castType(1, "Boolean");
      expect(result).toBe(true);
    });

    test("cast falsy number to boolean", () => {
      const result = PropertyService.castType(0, "Boolean");
      expect(result).toBe(false);
    });

    test("date string to unix epoch", () => {
      const result = PropertyService.castType(
        "2023-01-14T00:00:00.000Z",
        "DateTime"
      );
      expect(result).toBe(1673654400000);
    });

    test("invalid date string", () => {
      const result = PropertyService.castType("wtf", "DateTime");
      expect(result).toBe(null);
    });

    test("native number", () => {
      const result = PropertyService.castType(1.234, "Float64");
      expect(result).toBe(1.234);
    });

    test("invalid number", () => {
      const result = PropertyService.castType("one", "Float64");
      expect(result).toBe(null);
    });

    test("cast to number", () => {
      const result = PropertyService.castType("5", "Float64");
      expect(result).toBe(5);
    });

    test("native string", () => {
      const result = PropertyService.castType("hello", "String");
      expect(result).toBe("hello");
    });

    test("cast anything to string", () => {
      const result = PropertyService.castType(
        { foo: "bar" } as unknown as string,
        "String"
      );
      expect(result).toBe('{"foo":"bar"}');
    });
  });

  describe("getPropertyDefinitionList", () => {
    beforeEach(() => {
      Property.getProps = jest
        .fn()
        .mockResolvedValue([{ name: "foo", column: `` }]);
    });

    test("use cache", async () => {
      cacheHasFn.mockResolvedValue(true);
      cacheGetFn.mockResolvedValue([{ name: "cached", column: `` }]);
      const result = await PropertyService.getPropertyDefinitionList(
        PropFor.EVENT
      );
      expect(cacheGetFn).toBeCalledWith("event:mapping");
      expect(Property.getProps).not.toBeCalled();
      expect(result[0]).toEqual(expect.objectContaining({ name: "cached" }));
    });

    test("no cache", async () => {
      cacheHasFn.mockResolvedValue(false);
      cacheGetFn.mockResolvedValue(undefined);
      const result = await PropertyService.getPropertyDefinitionList(
        PropFor.EVENT
      );
      expect(cacheHasFn).toBeCalledWith("event:mapping");
      expect(cacheGetFn).not.toBeCalledWith("event:mapping");
      expect(Property.getProps).toBeCalled();
      expect(result[0]).toEqual(expect.objectContaining({ name: "foo" }));
    });
  });
});
