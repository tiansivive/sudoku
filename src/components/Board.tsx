import { Grid, useToast } from "@chakra-ui/react";


import { Cell } from "./Cell";

import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function'

import { useEffect, useMemo, useState } from 'react'
import { isEqual, last } from "lodash";
import { Matrix, Point, Region, point } from "../shared/grid";
import * as Validation from "../sudoku/validation";
import * as Str from "fp-ts/lib/string";
import { nonEmptyArray } from "fp-ts";
import { LineOfSight, vision } from "../sudoku/line-of-sight";
import { match } from "ts-pattern";

type Props = {
    size: Point
}
export const Board: React.FC<Props> = ({ size }) => {

    const [state, setState] = useState<State>({
        grid: initialGrid(size.x)
    })


    const update = (p: Point) => (value: string) => setState(prev => {
        const grid = [...prev.grid]
        grid[p.y][p.x] = last(value.split("")) || ""
        return { ...prev, grid }
    })

    const select = (p: Point) => () => setState(prev => {
        if (!prev.selected) return { ...prev, selected: p }
        if (isEqual(p, prev.selected)) return { ...prev, selected: undefined }

        return { ...prev, selected: p }
    })

    const move = (p: Point) => (direction: "up" | "down" | "left" | "right") => {
        const newX = match(direction)
            .with("left", () => p.x - 1)
            .with("right", () => p.x + 1)
            .otherwise(() => p.x) % size.x
        const newY = match(direction)
            .with("up", () => p.y - 1)
            .with("down", () => p.y + 1)
            .otherwise(() => p.y) % size.y

        setState(prev => ({
            ...prev, selected: {
                x: newX < 0 ? newX + size.x : newX,
                y: newY < 0 ? newY + size.y : newY,
            }
        }))

    }

    const _regions = useMemo(
        () => regions({ x: size.x / REGION_SIDE_SIZE, y: size.y / REGION_SIDE_SIZE })
        , [size])

    const lineOfSight = useMemo(() => {
        if (!state.selected) return { col: [], row: [], region: [] }
        return vision(state.grid, _regions)(state.selected)
    }, [_regions, state.grid, state.selected])

    const toast = useToast()
    useEffect(() => {
        if (solved(state.grid, _regions)) toast({
            title: 'Solved!',
            status: 'success',
            duration: 5000,
            isClosable: true,
        })
    }, [_regions, state.grid, toast])

    return (
        <Grid p="1px" bgColor="indigo" templateColumns={ template(size.x) } templateRows={ template(size.y) }>
            {
                state.grid.flatMap((row, y) =>
                    row.map((col, x) =>
                        <Cell
                            key={ `row:${y}-col:${x}` }
                            value={ col }
                            point={ { x, y } }
                            update={ update({ x, y }) }
                            move={ move({ x, y }) }
                            select={ select({ x, y }) }
                            selected={ selected(state)({ x, y }) }
                            active={ active({ x, y }, state.selected) }
                            invalid={ !valid(state.grid, _regions)({ x, y }) }
                            inLineOfSight={ inLineOfSight(lineOfSight)({ x, y }) }
                        />
                    )
                )
            }
        </Grid>
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


const regions = (size: Point): Region[] => {
    return F.pipe(
        A.Do,
        A.bind("row", () => nonEmptyArray.range(0, size.x - 1)),
        A.bind("col", () => nonEmptyArray.range(0, size.y - 1)),
        A.map(({ row, col }) => F.pipe(
            A.Do,
            A.bind("x", () => nonEmptyArray.range(0, size.x - 1)),
            A.bind("y", () => nonEmptyArray.range(0, size.y - 1)),
            A.map(({ x, y }) => ({ x: col * 3 + x, y: row * 3 + y }))
        )
        )
    )
}


type State = {
    grid: Matrix<string>,
    selected?: Point
}

export const REGION_SIDE_SIZE = 3

const initialGrid = (size: number) => F.pipe(
    A.replicate(size * size, ""),
    A.chunksOf(size)
)

const valid = Validation.valid(Str.Eq, Str.Monoid)
const solved = Validation.solved(Str.Eq, Str.Monoid)

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

const active = (p: Point, selected: Point | undefined) => selected && point.Eq.equals(p, selected)


