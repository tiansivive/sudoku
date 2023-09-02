/** Wrapper around `Object.fromEntries` that preserves strongly typed keys */
export const fromEntries = <E extends [string | number | symbol, any][]>(
  entries: E
) => Object.fromEntries(entries) as Record<E[number][0], E[number][1]>;
