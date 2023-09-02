import { entries, fromEntries } from ".";

function mapValues<T extends Record<string | number | symbol, any>, U>(
  object: T,
  mapper: (el: T[keyof T]) => U
): Record<keyof T, U>;

function mapValues<T extends Record<string | number | symbol, any>, U>(
  mapper: (el: T[keyof T]) => U
): (object: T) => Record<keyof T, U>;

function mapValues<T extends Record<string | number | symbol, any>, U>(
  ...args: [(el: T[keyof T]) => U] | [T, (el: T[keyof T]) => U]
) {
  if (args.length === 2) {
    const [obj, mapper] = args;
    return fromEntries(
      entries(obj).map<[keyof T, U]>(([key, value]) => [key, mapper(value)])
    );
  }
  const [mapper] = args;
  return (obj: T) => mapValues(obj, mapper);
}

export { mapValues };
