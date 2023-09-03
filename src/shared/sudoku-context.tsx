import { Reducer, createContext, useEffect, useMemo, useReducer } from "react";
import { type Matrix, Point, Region, Matrix as M, type Value, point } from "./grid";
import * as A from 'fp-ts/Array'
import * as F from 'fp-ts/function'
import { DEFAULT_GRID_SIZE } from "./settings";
import { match } from "ts-pattern";

import { isEqual, last } from "lodash/fp";
import fp from "lodash/fp";
import { assign, set } from "lib/objects";
import * as Obj from "lib/objects";
import { Direction } from "lib/types";
import { REGION_SIDE_SIZE } from "components/Board";
import * as Reg from "sudoku/regions";
import { LineOfSight, vision } from "sudoku/line-of-sight";
import { string } from "fp-ts";


export type Context = State & {
    dispatch: React.Dispatch<Action>,
    regions: Region[],
    lineOfSight: LineOfSight,
}
export const SudokuContext = createContext<Context>({
    status: "mount",
    mode: "value",
    grid: [],
    size: DEFAULT_GRID_SIZE,
    lineOfSight: { row: [], col: [], region: [] },
    regions: [],
    selected: [],
    dispatch: () => { },
    styles: { selection: "solid" }

})


type Props = {
    children: React.ReactNode;
}
export const SudokuProvider: React.FC<Props> = ({ children }) => {


    const [state, dispatch] = useReducer(reducer, {
        status: "mount",
        mode: "value",
        grid: initialGrid(DEFAULT_GRID_SIZE.x),
        size: DEFAULT_GRID_SIZE,
        selected: [],
        styles: { selection: "solid" }
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
            .then(grid => M.Functor.map(grid, (n: number) => n === 0 ? "" : n.toString()))
            .then(grid => dispatch({ type: "GRID.INITIALIZE", payload: grid }))
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


export type State = {
    status: "mount" | "fetching" | "ok",
    mode: "value" | "notes" | "candidates" | "coloring"
    grid: Matrix<Value>,
    size: Point,
    selected: Point[],
    color?: string,
    styles: {
        selection: "solid" | "border"
    }
}


type Actions = {
    "FETCH": void
    "MODE.SET": State["mode"]
    "GRID.INITIALIZE": Matrix<string>;
    "GRID.SET": { status: State["status"], grid: Matrix<Value> }
    "CELL.UPDATE": { value: string, coords: Point }
    "CELL.SELECT": Point,
    "CELL.SELECT.MULTI": Point,
    "CELL.HIGHLIGHT": Point,
    "COLOR.SELECT": string,
    "MOVE": { coords: Point, direction: Direction }
    "CONFIG.STYLES.SELECTION": State["styles"]["selection"]
}

type ActionMap = {
    [K in keyof Actions]: { type: K, payload: Actions[K] }
}
type Action = ActionMap[keyof Actions]
type GetAction<K extends keyof Actions> = ActionMap[K]

type StateUpdater<S, K extends keyof ActionMap> = (state: S) => (action: GetAction<K>) => State

const reducer
    : Reducer<State, Action>
    = (state, action) => match(action)
        .with({ type: "FETCH" }, () => set(state, "status", "fetching"))
        .with({ type: "GRID.SET" }, ({ payload }) => assign(state, payload))
        .with({ type: "GRID.INITIALIZE" }, ({ payload }) =>
            set(state, "grid", M.Functor.map(payload, value =>
                ({ value, candidates: [], notes: [], colors: [], locked: value !== "" }))))
        .with({ type: "MODE.SET" }, ({ payload }) => set(state, "mode", payload))
        .with({ type: "CELL.UPDATE" }, update(state))
        .with({ type: "CELL.SELECT" }, select(state))
        .with({ type: "CELL.SELECT.MULTI" }, multiSelect(state))
        .with({ type: "COLOR.SELECT" }, ({ payload }) => set(state, "color", payload))
        .with({ type: "MOVE" }, ({ payload: { direction } }) => Obj.update(state, "selected", next(direction, state.size)))
        .with({ type: "CONFIG.STYLES.SELECTION" }, ({ payload }) => Obj.set(state, "styles.selection", payload))
        .otherwise(() => state)


const update: StateUpdater<State, "CELL.UPDATE"> = state => ({ payload: { coords, value } }) =>
    match(state.mode)
        .when(() => Boolean(state.grid[coords.y][coords.x].locked), () => state)
        .with("value", () => fp.set(`grid[${coords.y}][${coords.x}].value`, prune(value), state))
        .with("candidates", () => fp.update(`grid[${coords.y}][${coords.x}].candidates`, (current: string[]) => toggle(current, value), state))
        .otherwise(() => state)




const select
    : StateUpdater<State, "CELL.SELECT">
    = state => ({ payload }) => {
        return match(state)
            .with({ selected: [], color: undefined }, () => set(state, "selected", [payload]))
            .when(({ selected, color }) => A.isEmpty(selected) && Boolean(color), () => F.pipe(
                state,
                set("selected", [payload]),
                fp.set(`grid[${payload.y}][${payload.x}].colors`, [state.color])
            ) as State)
            .when(({ selected, color }) => isEqual([payload], selected) && Boolean(color), () => F.pipe(
                state,
                set("selected", []),
                fp.set(`grid[${payload.y}][${payload.x}].colors`, [state.color])
            ) as State)
            .otherwise(() => set(state, "selected", [payload]))


    }
const multiSelect
    : StateUpdater<State, "CELL.SELECT.MULTI">
    = state => ({ payload }) =>
        match(state)
            .when(
                ({ selected }) => A.elem(point.Eq)(payload, selected),
                st => Obj.update(st, "selected", A.filter<Point>(p => point.Eq.equals(p, payload))))
            .otherwise(st => Obj.update(st, "selected", A.append(payload)))






const next = (direction: Direction, size: Point) => A.map<Point, Point>(p => {
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
})


const prune = (value: string) => last(value.trim().split("")) || ""
const toggle = (state: string[], value: string): string[] =>
    match(prune(value))
        .with("", () => state)
        .when(v => state.indexOf(v) === -1, v => state.concat(v).sort(string.Ord.compare))
        .otherwise(v => A.unsafeDeleteAt(state.indexOf(v), state))



const initialGrid = (size: number) => F.pipe(
    A.replicate<Value>(size * size, { value: "", candidates: [], notes: [], colors: [] }),
    A.chunksOf(size)
)



