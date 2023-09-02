import fp from "lodash/fp";

type Merge = {
  <Source extends object, Target extends object>(source: Source): (
    target: Target
  ) => Target & Source;
  <Source extends object, Target extends object>(
    target: Target,
    source: Source
  ): Target & Source;
};

export const merge: Merge = <S, T>(...args: [S] | [S, T]) => {
  if (args.length === 2) {
    const [target, source] = args;
    return fp.merge(target, source);
  }
  const [source] = args;
  return (target) => fp.merge(target, source);
};
