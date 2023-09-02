import fp from "lodash/fp";

/** Wrapper around `fp.values` that preserves strongly typed keys */
export const values = <T extends object>(obj: T) =>
  fp.values(obj) as T[keyof T][];
