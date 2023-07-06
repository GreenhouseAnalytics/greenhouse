import { parseISO, isValid as isValidDate } from "date-fns";
import { LocalCache } from "../cache";
import {
  Property,
  PropFor,
  PropValue,
  PropertyRow,
  PropertyRecord,
  ValidPropDataTypes,
  ValidPropDataType,
  PROPERTY_PREFIX,
} from "../data/Property";
import { Event } from "../data/Event";
import { User } from "../data/User";
import logger from "../logger";

const cacheStore = new LocalCache(60);

/**
 * Manages creating new properties on the event and user tables.
 */
export const PropertyService = {
  /**
   * Generate a cache key
   */
  getCacheKey(forResource: PropFor, type: "columns" | "mapping") {
    return `${forResource}:${type}`;
  },

  /**
   * Create a valid column name from a user-defined string
   */
  convert2ColumnName(name: string, existing: string[]) {
    let column = name
      .trim()
      .replace(/([a-z])([A-Z])/g, "$1_$2") // convert camelCase to snake_case
      .replace(/[\.\-\s]/g, "_") // Convert dots and dashes to underlines
      .replace(/[^a-zA-Z0-9_]/g, "") // Remove unsupported characters
      .replace(/_+/g, "_") // Collapse multiple underscores
      .substring(0, 30)
      .toLowerCase();

    // Start with a p_ to denote it as a property
    column = `${PROPERTY_PREFIX}_${column}`;

    // Ensure the column is unique
    let i = 0;
    const base = column;
    while (existing.includes(column)) {
      i++;
      column = `${base}${i}`;
    }

    return column;
  },

  /**
   * Determine the property type
   */
  determineDataType(val: unknown): ValidPropDataType | null {
    if (val === null || typeof val === "undefined") {
      return null;
    }

    switch (typeof val) {
      case "number":
        return "Float64";
      case "boolean":
        return "Boolean";
      case "object":
      case "string": {
        // Is the string actually a date
        if (typeof val === "string") {
          const isDate = isValidDate(parseISO(val));
          if (isDate) {
            return "DateTime";
          }
        }
        return "String";
      }
    }
    return "String";
  },

  /**
   * Change the property type to meet the needs of both data types
   */
  expandDataType(
    newType: ValidPropDataType,
    existingType: ValidPropDataType
  ): ValidPropDataType {
    if (newType === existingType) {
      return newType;
    }
    if (existingType === "Boolean" && newType === "Float64") {
      return "Float64";
    }
    if (existingType === "Float64" && newType === "Boolean") {
      return "Float64";
    }
    return "String";
  },

  /**
   * Create/update prop columns if necessary
   */
  async updatePropColumns(
    propFor: PropFor,
    propsEntries: [/*name*/ string, /*value*/ unknown][]
  ) {
    const columnMap = new Map<
      string,
      { name: string; type: ValidPropDataType }
    >();
    const columnUpdates = new Map<string, ValidPropDataType>();
    const newPropMappings: PropertyRow[] = [];

    // Existing props
    const tableColumnTypes = await this.getTablePropColumns(propFor);
    const tableColumnNames = Object.keys(tableColumnTypes);

    // Get existing prop name to column mappings
    const existingProps = await this.getPropertyDefinitionList(propFor);
    const existingPropMap = new Map<string, PropertyRecord>();
    existingProps.forEach((row) => {
      existingPropMap.set(row.name.toLowerCase(), row);
    });

    // Find props that need to be added/updated
    propsEntries.forEach(([name, value]) => {
      const normalizedName = name.toLowerCase();
      const existingMapping = existingPropMap.get(normalizedName);
      let columnName: string;

      // Infer the property type from the input value
      // If the input value is null, no need to create the column
      let columnType = this.determineDataType(value);
      if (columnType === null) {
        return;
      }

      // This property has already been defined
      if (typeof existingMapping !== "undefined") {
        columnName = existingMapping.column;
      }
      // Create the column name
      else {
        columnName = this.convert2ColumnName(name, tableColumnNames);
      }
      const existingType = tableColumnTypes[columnName];
      const expandedType = this.expandDataType(columnType, existingType);

      // A new table column needs to be created
      if (!tableColumnNames.includes(columnName)) {
        columnUpdates.set(columnName, columnType);
      }
      // The existing property type needs to change
      else if (
        typeof existingType !== "undefined" &&
        existingType !== expandedType
      ) {
        columnType = expandedType;
        columnUpdates.set(columnName, expandedType);
        logger.warn(
          `Property '${name}' type being changed from ${existingType} to ${columnType}`
        );
      }

      // Register the prop name to column mapping
      if (!existingMapping) {
        newPropMappings.push({
          name,
          column: columnName,
          for: propFor,
        });
      }

      columnMap.set(name, { name: columnName, type: columnType });
    });

    // Create property mappings
    let createDefs = Promise.resolve();
    if (newPropMappings.length) {
      createDefs = Property.create(newPropMappings);
    }

    // Add prop columns to table
    let createCols = Promise.resolve();
    if (columnUpdates.size) {
      createCols = Property.addPropColumns(propFor, columnUpdates);
    }
    await Promise.all([createDefs, createCols]);

    // Clear cache
    if (newPropMappings.length || columnUpdates.size) {
      await Promise.all([
        cacheStore.remove(this.getCacheKey(propFor, "columns")),
        cacheStore.remove(this.getCacheKey(propFor, "mapping")),
      ]);
    }

    return columnMap;
  },

  /**
   * Get table model
   */
  getTableModel(table: PropFor) {
    switch (table) {
      case PropFor.EVENT:
        return Event;
      case PropFor.USER:
        return User;
      default:
        return null;
    }
  },

  /**
   * Get all the table props and their types
   */
  async getTablePropColumns(table: PropFor) {
    const props: Record<string, ValidPropDataType> = {};

    // Use cache
    const cacheKey = this.getCacheKey(table, "columns");
    const hasCache = await cacheStore.has(cacheKey);
    if (hasCache) {
      const cacheVal = await cacheStore.get<typeof props>(cacheKey);
      return cacheVal ?? {};
    }

    // Get from DB
    const model = this.getTableModel(table);
    if (model) {
      const data = await model?.describe();

      // Extract types
      data
        .filter(({ name }) => {
          return name.startsWith(`${PROPERTY_PREFIX}_`);
        })
        .forEach(({ name, type: fullDbType }) => {
          // Cleanup DB type notation and ensure it is a supported type
          let type = fullDbType.replace(/Nullable\((.*?)\)/, "$1");
          if (type === "Bool") {
            type = "Boolean";
          }
          if (!ValidPropDataTypes.includes(type as ValidPropDataType)) {
            logger.warn(`Invalid property type: ${fullDbType}`);
            return;
            type;
          }
          props[name] = type as ValidPropDataType;
        });
    }

    await cacheStore.set(cacheKey, props);
    return props;
  },

  /**
   * Get the full list of property definition
   */
  async getPropertyDefinitionList(table: PropFor) {
    // Use cache
    const cacheKey = this.getCacheKey(table, "mapping");
    const hasCache = await cacheStore.has(cacheKey);
    if (hasCache) {
      const cacheVal = await cacheStore.get<PropertyRecord[]>(cacheKey);
      return cacheVal ?? [];
    }

    // Fetch data
    const props = await Property.getProps(table);
    await cacheStore.set(cacheKey, props);
    return props;
  },

  /**
   * Cast the value to a type, or null
   */
  castType(
    value: PropValue,
    type: ValidPropDataType
  ): string | number | boolean | null {
    if (type === "Boolean") {
      if (typeof value === "boolean") {
        return value;
      } else if (typeof value === "number") {
        return value ? true : false;
      }
    } else if (type === "DateTime" && typeof value === "string") {
      const date = parseISO(value);
      const isDate = isValidDate(date);
      if (isDate) {
        return date.getTime();
      }
    } else if (type === "Float64") {
      const num = Number(value);
      if (!isNaN(num)) {
        return num;
      }
    } else if (type === "String") {
      if (typeof value === "string") {
        return value;
      }
      return JSON.stringify(value);
    }
    return null;
  },
};
