import { Reducer, createContext, useEffect, useMemo, useReducer } from "react";
import { Matrix, Point, Region } from "./grid";
import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function'
import { DEFAULT_GRID_SIZE } from "./settings";
import { match } from "ts-pattern";

import { isEqual, last } from "lodash/fp";
import fp from "lodash/fp";
import { assign, set } from "lib/objects";
import { Direction } from "lib/types";
import { REGION_SIDE_SIZE } from "components/Board";
import * as Reg from "sudoku/regions";
import { LineOfSight, vision } from "sudoku/line-of-sight";


type Context = State & {
    dispatch: React.Dispatch<Action>,
    regions: Region[],
    lineOfSight: LineOfSight,
}
export const SudokuContext = createContext<Context>({
    status: "mount",
    grid: [],
    size: DEFAULT_GRID_SIZE,
    lineOfSight: { row: [], col: [], region: [] },
    regions: [],
    dispatch: () => { }

})


type Props = {
    children: React.ReactNode;
}
export const SudokuProvider: React.FC<Props> = ({ children }) => {


    const [state, dispatch] = useReducer(reducer, {
        status: "mount",
        grid: initialGrid(DEFAULT_GRID_SIZE.x),
        size: DEFAULT_GRID_SIZE
    })


    const regions = useMemo(
        () => Reg.regions({ x: state.size.x / REGION_SIDE_SIZE, y: state.size.y / REGION_SIDE_SIZE })
        , [state.size])

    const lineOfSight = useMemo(() => {
        if (!state.selected) return { col: [], row: [], region: [] }
        return vision(state.grid, regions)(state.selected)
    }, [regions, state.grid, state.selected])

    useEffect(() => {
        fetch("https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){grids{value}}}")
            .then(res => res.json())
            .then(res => res.newboard.grids[0].value)
            .then(grid => grid.map((row: number[]) => row.map((e: number) => e === 0 ? "" : e.toString())))
            .then(grid => dispatch({ type: "GRID.SET", payload: { status: "ok", grid } }))
    }, [])

    return <SudokuContext.Provider value={ {
        ...state,
        dispatch,
        regions,
        lineOfSight
    } }>
        { children }
    </SudokuContext.Provider>
}


type State = {
    status: "mount" | "fetching" | "ok"
    grid: Matrix<string>,
    size: Point,
    selected?: Point
}

type Actions = {
    "FETCH": void
    "GRID.SET": { status: State["status"], grid: Matrix<string> }
    "CELL.UPDATE": { value: string, coords: Point }
    "CELL.SELECT": Point,
    "CELL.HIGHLIGHT": Point,
    "MOVE": { coords: Point, direction: Direction }
}

type ActionMap = {
    [K in keyof Actions]: { type: K, payload: Actions[K] }
}

type Action = ActionMap[keyof Actions]
type GetAction<K extends keyof Actions> = ActionMap[K]


const reducer: Reducer<State, Action> = (state, action) =>
    match(action)
        .with({ type: "FETCH" }, () => set(state, "status", "fetching"))
        .with({ type: "GRID.SET" }, ({ payload }) => assign(state, payload))
        .with({ type: "CELL.UPDATE" }, ({ payload: { coords, value } }) => fp.set(`grid[${coords.y}][${coords.x}]`, prune(value), state))
        .with({ type: "CELL.SELECT" }, select(state))
        .with({ type: "MOVE" }, ({ payload: { coords, direction } }) => set(state, "selected", next(coords, direction, state.size)))
        .otherwise(() => state)


const select = (state: State) => ({ payload }: GetAction<"CELL.SELECT">): State => {

    if (!state.selected) return set(state, "selected", payload)
    if (isEqual(payload, state.selected)) return set(state, "selected", undefined)

    return set(state, "selected", payload)
}


const next = (p: Point, direction: Direction, size: Point): Point => {
    const newX = match(direction)
        .with("left", () => p.x - 1)
        .with("right", () => p.x + 1)
        .otherwise(() => p.x) % size.x
    const newY = match(direction)
        .with("up", () => p.y - 1)
        .with("down", () => p.y + 1)
        .otherwise(() => p.y) % size.y

    return {
        x: newX < 0 ? newX + size.x : newX,
        y: newY < 0 ? newY + size.y : newY,
    }
}

const prune = (value: string) => last(value.trim().split("")) || ""

const initialGrid = (size: number) => F.pipe(
    A.replicate(size * size, ""),
    A.chunksOf(size)
)



