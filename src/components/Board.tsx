import { Grid } from "@chakra-ui/react";


import { Cell } from "./Cell";

import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function'

import { useState } from 'react'
import { isEqual } from "lodash";

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

    return (
        <Grid p="1px" bgColor="indigo" templateColumns={ `repeat(${size.x}, 1fr)` } gap="1px">
            {
                state.grid.flatMap((row, y) =>
                    row.map((col, x) =>
                        <Cell
                            value={ col }
                            update={ update({ x, y }) }
                            select={ select({ x, y }) }
                            selected={ isEqual(state.selected, { x, y }) }
                        />
                    )
                )
            }
        </Grid>
    )
}


type State = {
    grid: Matrix<string>,
    selected?: Point
}


type Matrix<T> = T[][]
type Point = { x: number; y: number };
const initialGrid = (size: number) => F.pipe(
    A.replicate(size * size, ""),
    A.chunksOf(size)
)