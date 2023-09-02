import fp from "lodash/fp";
import { SetRequired } from "type-fest";

type Defaults = {
  <T extends object>(source: Partial<T>): (
    obj: T
  ) => SetRequired<T, keyof typeof obj>;
  <T extends object>(obj: T, source: Partial<T>): SetRequired<
    T,
    keyof typeof obj
  >;
};
export const defaults: Defaults = <T>(
  ...args: [Partial<T>] | [T, Partial<T>]
) => {
  if (args.length === 2) {
    const [obj, source] = args;
    return fp.defaultsDeep(source, obj);
  }
  const [source] = args;
  return (obj) => fp.defaultsDeep(source, obj);
};
