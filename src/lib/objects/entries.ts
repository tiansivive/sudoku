/** Wrapper around `Object.entries` that preserves strongly typed keys */
export const entries = <T extends object>(obj: T) =>
  Object.entries(obj) as [keyof T, T[keyof T]][];
