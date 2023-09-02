import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function'
import * as NEA from "fp-ts/NonEmptyArray";
import { Point, Region } from 'shared/grid';

export const regions = (size: Point): Region[] => {
    return F.pipe(
        A.Do,
        A.bind("row", () => NEA.range(0, size.x - 1)),
        A.bind("col", () => NEA.range(0, size.y - 1)),
        A.map(({ row, col }) => F.pipe(
            A.Do,
            A.bind("x", () => NEA.range(0, size.x - 1)),
            A.bind("y", () => NEA.range(0, size.y - 1)),
            A.map(({ x, y }) => ({ x: col * 3 + x, y: row * 3 + y }))
        )
        )
    )
}