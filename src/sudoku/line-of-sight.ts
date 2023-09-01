
import { Matrix, Point, Region, point } from "../shared/grid";

import * as A from 'fp-ts/Array'

export type LineOfSight = {
    row: Point[];
    col: Point[];
    region: Region;
}

export const vision = <T>(grid: Matrix<T>, regions: Region[]) => (p: Point): LineOfSight => {

    const row = grid[p.y].map((_, x) => ({ x, y: p.y }))
    const col = grid.map(A.findFirst(i => i === p.x)).map((_, y) => ({ x: p.x, y }))
    const region = findRegion(regions)(p) || []

    return { row, col, region }

}


export const findRegion = (regions: Region[]) => (p: Point) => {
    const includes = A.elem(point.Eq)
    const found = regions.find(includes(p))
    return found
}