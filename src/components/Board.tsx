import { Grid } from "@chakra-ui/react";


import { Cell } from "./Cell";

import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function'

import { useState } from 'react'

type Props = {
    size: { x: number; y: number };
}
export const Board: React.FC<Props> = ({ size }) => {

    const [grid, setGrid] = useState<Matrix<string>>(initialState(size.x))


    const update = (coords: Props["size"]) => (value: string) => setGrid(prev => {
        const copy = [...prev]
        copy[coords.y][coords.x] = value
        return copy
    })

    return (
        <Grid p="1px" bgColor="indigo" templateColumns={ `repeat(${size.x}, 1fr)` } gap="1px">
            {
                grid.flatMap((row, y) =>
                    row.map((col, x) =>
                        <Cell value={ col } update={ update({ x, y }) } />
                    )
                )
            }

        </Grid>
    )
}

type Matrix<T> = T[][]

const initialState = (size: number) => F.pipe(
    A.replicate(size * size, ""),
    A.chunksOf(size)
)