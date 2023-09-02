/** Proxy for `Object.assign` with more strict types (both objects must be of the same type)
 * 
 * The `next` object is allowed to be a partial, which is useful f ex for React state updaters:
 * 
```ts
type Foo = { foo: string, bar: number };

const [state, setState] = useState<Foo>({ foo: "foo", bar: 0 });

setState(assign({ bar: 1 })); // Next state: { foo: "foo"; bar: 1 }
```
 */

type Assign = {
  <T extends object, P extends Partial<T> = Partial<T>>(next: P): (
    target: T
  ) => T;
  <T extends object, P extends Partial<T> = Partial<T>>(target: T, next: P): T;
};
export const assign: Assign = <T, P>(...args: [P] | [T, P]) => {
  if (args.length === 2) {
    const [target, next] = args;
    return Object.assign({}, target, next);
  }
  const [next] = args;
  return (target) => Object.assign({}, target, next);
};
