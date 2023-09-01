import { Grid } from "@chakra-ui/react";


import { Cell } from "./Cell";

import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function'

import { useMemo, useState } from 'react'
import { isEqual } from "lodash";
import { Matrix, Point, Region, point } from "../shared/grid";
import * as Validation from "../sudoku/validation";
import * as Str from "fp-ts/lib/string";
import { nonEmptyArray } from "fp-ts";
import { LineOfSight, vision } from "../sudoku/line-of-sight";

type Props = {
    size: Point
}
export const Board: React.FC<Props> = ({ size }) => {

    const [state, setState] = useState<State>({
        grid: initialGrid(size.x)
    })


    const update = (p: Point) => (value: string) => setState(prev => {
        const grid = [...prev.grid]
        grid[p.y][p.x] = value
        return { ...prev, grid }
    })

    const select = (p: Point) => () => setState(prev => {
        if (!prev.selected) return { ...prev, selected: p }
        if (isEqual(p, prev.selected)) return { ...prev, selected: undefined }

        return { ...prev, selected: p }
    })

    const _regions = useMemo(() => {
        const rs = regions({ x: size.x / 3, y: size.y / 3 })
        console.log(rs)
        return rs
    }, [size])

    const lineOfSight = useMemo(() => {
        if (!state.selected) return { col: [], row: [], region: [] }
        return vision(state.grid, _regions)(state.selected)
    }, [_regions, state.grid, state.selected])

    return (
        <Grid p="1px" bgColor="indigo" templateColumns={ `repeat(${size.x}, 1fr)` } gap="1px">
            {
                state.grid.flatMap((row, y) =>
                    row.map((col, x) =>
                        <Cell
                            key={ `row:${y}-col:${x}` }
                            value={ col }
                            update={ update({ x, y }) }
                            select={ select({ x, y }) }
                            selected={ selected(state)({ x, y }) }
                            invalid={ !valid(state.grid, _regions)({ x, y }) }
                            inLineOfSight={ inLineOfSight(lineOfSight)({ x, y }) }
                        />
                    )
                )
            }
        </Grid>
    )
}


const regions = (size: Point): Region[] => {
    return F.pipe(
        A.Do,
        A.bind("row", () => nonEmptyArray.range(0, size.x - 1)),
        A.bind("col", () => nonEmptyArray.range(0, size.y - 1)),
        A.map(({ row, col }) => {

            return F.pipe(
                A.Do,
                A.bind("x", () => nonEmptyArray.range(0, size.x - 1)),
                A.bind("y", () => nonEmptyArray.range(0, size.y - 1)),
                A.map(({ x, y }) => ({ x: col * 3 + x, y: row * 3 + y }))

            )



        })
    )
}


type State = {
    grid: Matrix<string>,
    selected?: Point
}

const initialGrid = (size: number) => F.pipe(
    A.replicate(size * size, ""),
    A.chunksOf(size)
)

const valid = Validation.valid(Str.Eq, Str.Monoid)

const includes = A.elem(point.Eq)
const inLineOfSight = ({ row, col, region }: LineOfSight) => (p: Point) =>
    includes(p, col) || includes(p, row) || includes(p, region)

const selected = ({ selected, grid }: State) => (p: Point) => {
    if (!selected) return false
    if (point.Eq.equals(selected, p)) return true

    const selectedVal = grid[selected.y][selected.x]
    const currentVal = grid[p.y][p.x]

    if (currentVal === "") return false

    return selectedVal === currentVal

}
