import { SetRequired } from "type-fest";

import { isDefined } from "lib/nullable/nullable";

import { FlattenType, SetNonNullable } from "lib/types";

type Has<O, Keys extends keyof O> = FlattenType<
  SetNonNullable<SetRequired<Pick<O, Keys>, Keys>, Keys>
>;

export function has<O extends object, K extends keyof O>(
  k: K
): (object: O) => object is O & Has<O, K>;
export function has<O extends object, K extends keyof O>(
  keys: K[]
): (object: O) => object is O & Has<O, K>;
export function has<O extends object, K extends keyof O>(
  object: O,
  keys: K[]
): object is O & Has<O, K>;
export function has<O extends object, K extends keyof O>(
  ...args: [O, K[]] | [K[]] | [K]
) {
  if (args.length === 2) {
    const [object, keys] = args;
    return check(object, keys);
  }

  const [_keys] = args;
  const keys = Array.isArray(_keys) ? _keys : [_keys];
  return (object: O) => check(object, keys);
}

export const check = <O extends object, K extends keyof O>(
  obj: O,
  ks: K[]
): obj is O & Has<O, K> => ks.every((k) => isDefined(obj[k]));
