import fp from "lodash/fp";

import { Get } from "lib/types";



type Path = string | readonly string[];

/** Proxy for lodash fp `get` with better type inference.
 * Overloaded to support both imperative and point free style
 *
 * Dynamic paths is supported if an array is passed as `path`.
 * If an array is passed as `path`, it needs to be `const`: `["foo", "bar"] as const` */
function get<T extends object, P extends Path>(obj: T, path: P): Get<T, P>;

function get<T extends object, P extends Path>(path: P): (obj: T) => Get<T, P>;

function get<T extends object, P extends Path>(...args: [T, P] | [P]) {
  if (args.length === 2) {
    const [obj, path] = args;
    return fp.get(path)(obj);
  }
  const [path] = args;
  return fp.get(path);
}

export { get };
