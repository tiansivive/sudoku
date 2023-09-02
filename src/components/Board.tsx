import { Box, Grid, Radio, RadioGroup, Spinner, Stack, useToast } from "@chakra-ui/react";


import { Cell } from "./Cell";

import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function'

import { useContext, useEffect } from 'react'

import { Point, point, Value as V } from "shared/grid";
import * as Validation from "sudoku/validation";
import * as Str from "fp-ts/lib/string";

import { LineOfSight } from "sudoku/line-of-sight";

import { State, SudokuContext } from "shared/sudoku-context";

type Props = {
    size: Point
}
export const Board: React.FC<Props> = ({ size }) => {

    const context = useContext(SudokuContext)

    const toast = useToast()
    useEffect(() => {

        if (solved(context.grid, context.regions)) toast({
            title: 'Solved!',
            status: 'success',
            duration: 5000,
            isClosable: true,
        })
    }, [context.regions, context.grid, toast])



    return (<Box>

        <Grid p="1px" bgColor="indigo" templateColumns={ template(size.x) } templateRows={ template(size.y) }>
            {
                context.grid.flatMap((row, y) =>
                    row.map((col, x) =>
                        <Cell
                            key={ `row:${y}-col:${x}` }
                            value={ col }
                            point={ { x, y } }
                            update={ value => context.dispatch({ type: "CELL.UPDATE", payload: { value, coords: { x, y } } }) }
                            move={ direction => context.dispatch({ type: "MOVE", payload: { direction, coords: { x, y } } }) }
                            select={ () => context.dispatch({ type: "CELL.SELECT", payload: { x, y } }) }
                            selected={ selected(context)({ x, y }) }
                            active={ active({ x, y }, context.selected) }
                            invalid={ !valid(context.grid, context.regions)({ x, y }) }
                            inLineOfSight={ inLineOfSight(context.lineOfSight)({ x, y }) }
                        />
                    )
                )
            }
        </Grid>
        <RadioGroup onChange={ (payload: State["mode"]) => context.dispatch({ type: "MODE.SET", payload }) } value={ context.mode }>
            <Stack direction='row'>
                <Radio value="value">Value</Radio>
                <Radio value="notes">Notes</Radio>
                <Radio value="candidates">Candidates</Radio>
            </Stack>
        </RadioGroup>
        { context.status === "fetching" && <Spinner size="xl" /> }


    </Box>
    )
}


const template = (size: number) =>
    F.pipe(
        A.replicate(size, "1fr"),
        A.intersperse("1px"),
        A.mapWithIndex((i, val) => {
            if (i === 0) return val
            const offset = i + 1
            const range = REGION_SIDE_SIZE * 2 // there's a an extra row per cell that's used as the gap
            return offset % range === 0 ? "5px" : val
        }),
        A.intercalate(Str.Monoid)(" ")
    )


export const REGION_SIDE_SIZE = 3

const valid = Validation.valid(V.Eq, V.Monoid)
const solved = Validation.solved(V.Eq, V.Monoid)

const includes = A.elem(point.Eq)
const inLineOfSight = ({ row, col, region }: LineOfSight) => (p: Point) =>
    includes(p, col) || includes(p, row) || includes(p, region)

const selected = ({ selected, grid }: State) => (p: Point) => {
    if (!selected) return false
    if (point.Eq.equals(selected, p)) return true

    const selectedVal = grid[selected.y][selected.x]
    const currentVal = grid[p.y][p.x]

    if (currentVal.value === "") return false

    return V.Eq.equals(selectedVal, currentVal)
}

const active = (p: Point, selected: Point | undefined) => selected && point.Eq.equals(p, selected)


