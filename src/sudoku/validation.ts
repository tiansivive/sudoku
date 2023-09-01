import { Eq } from "fp-ts/lib/Eq";
import { Matrix, Point, Region } from "../shared/grid";

import { Monoid } from "fp-ts/lib/Monoid";
import { vision } from "./line-of-sight";

export const valid = <T>(eq: Eq<T>, monoid: Monoid<T>) => (grid: Matrix<T>, regions: Region[]) => (p: Point) => {

    const elem = grid[p.y][p.x]
    if (monoid.empty === elem) return true

    const { region, row, col } = vision(grid, regions)(p)
    const _rowValues = row.map(p => grid[p.y][p.x])
    const _colValues = col.map(p => grid[p.y][p.x])
    const _regionValues = region.map(p => grid[p.y][p.x])

    const check = (container: T[]) => container.filter(e => eq.equals(e, elem)).length < 2
    return check(_rowValues) && check(_colValues) && check(_regionValues)

}





export const solved = <T>(eq: Eq<T>, monoid: Monoid<T>) => (grid: Matrix<T>, regions: Region[]): boolean => {
    const _valid = valid(eq, monoid)(grid, regions)
    return grid.reduce(
        (res, row, y) => res && row.reduce(
            (res, val, x) => res && val !== monoid.empty && _valid({ x, y })
            , true)
        , true)
}