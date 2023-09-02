import { flatten } from "lodash";

/**
 * Returns nested paths of an object:
 * getPaths({ foo: true, bar: { baz: false }}) // ["foo", "bar.baz"]
 */

export const getPaths = (obj: Record<string, any>, prev = ""): string[] =>
  flatten(
    Object.entries(obj).map(([key, val]) => {
      if (typeof val === "object" && !Array.isArray(val) && val !== null) {
        const newKey = [prev, key].filter((v) => v !== "").join(".");
        return getPaths(val, newKey);
      }
      return [prev, key].filter((v) => v !== "").join(".");
    })
  );
