import fp from "lodash/fp";

import { FlattenType } from "lib/types";

type Obj = Record<string, unknown>;

/** Proxy for lodash fp `pick` with better type inference. */
function pick<O extends Obj, K extends keyof O>(
  keys: K[]
): (obj: O) => FlattenType<Pick<O, K>>;

function pick<O extends Obj, K extends keyof O>(
  obj: O,
  keys: K[]
): FlattenType<Pick<O, K>>;

function pick<O extends Obj, K extends keyof O>(...args: [O, K[]] | [K[]]) {
  if (args.length === 2) {
    const [obj, keys] = args;
    return fp.pick(keys)(obj);
  }
  const [keys] = args;
  return (obj: O) => fp.pick(keys)(obj);
}

export { pick };
