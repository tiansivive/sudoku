import { Box, GridItem, Input } from "@chakra-ui/react"
import { useContext, useEffect, useRef } from "react"
import { Point, Value } from "shared/grid"

import styles from './cell.module.css'
import { match } from "ts-pattern"
import { Context, State, SudokuContext } from "shared/sudoku-context"
import classNames from "classnames"




type Props = {
    value: Value,
    point: Point,
    update: (val: string) => void,
    selected?: boolean,
    highlighted?: boolean,
    invalid?: boolean,
    inLineOfSight?: boolean,
    move: (direction: "up" | "down" | "left" | "right") => void
}


export const Cell: React.FC<Props> = ({ value, point, update, move, highlighted, selected, invalid, inLineOfSight }) => {


    const context = useContext(SudokuContext)
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (selected) ref.current?.focus()
    }, [selected, context.mode])
    return (
        <GridItem
            gridColumnStart={ point.x * 2 + 1 }
            gridRowStart={ point.y * 2 + 1 }
            // border={ active ? "3px solid" : "none" }
            // borderColor={ active ? "lightpink" : "purple.500" }
            className={ styles.cell }
            bgColor={ value.colors[0] }
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="64px"
            w="64px"
            onClick={ select(context, point) }
            cursor="pointer"

        >
            <Box className={ overlay(context.styles.selection, { highlighted, inLineOfSight, selected, invalid }) } >

                { match(value.value)
                    .with("", () =>
                        <Input
                            className={ styles.noCaret }
                            cursor="pointer"
                            color={ selected ? "lightpink" : "purple.500" }
                            fontSize="lg"
                            variant='unstyled'
                            value={ value.candidates.join("") }
                            textAlign="center"
                            onChange={ e => update(e.target.value) }
                            ref={ ref }
                            onKeyDown={ direction(move) }

                        />)
                    .otherwise(() =>
                        <Input
                            className={ styles.noCaret }
                            cursor="pointer"

                            color={ textColor({ selected, invalid, locked: value.locked }) }
                            fontSize="5xl"
                            variant='unstyled'
                            value={ value.value }
                            textAlign="center"
                            onChange={ e => update(e.target.value) }
                            ref={ ref }
                            onKeyDown={ direction(move) }

                        />)
                }
            </Box>
        </GridItem>
    )
}



const select = (context: Context, point: Point) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {

    context.dispatch({
        type: e.getModifierState("Shift") ? "CELL.SELECT.MULTI" : "CELL.SELECT",
        payload: point
    })
}

const overlay = (mode: State["styles"]["selection"], props: Pick<Props, "selected" | "invalid" | "highlighted" | "inLineOfSight">): string => {
    const _color = match(props)
        .with({ selected: true }, () => styles.selected)
        .with({ highlighted: true }, () => styles.highlighted)
        .with({ invalid: true }, () => styles.invalid)
        .with({ inLineOfSight: true }, () => styles.lineOfSight)
        .otherwise(() => styles.default)

    const _mode = match(mode)
        .with("border", () => styles.bordered)
        .with("solid", () => styles.solid)
        .exhaustive()




    return classNames(styles.overlay, _mode, _color)
}
// const bgColor = (props: Pick<Props, "selected" | "invalid" | "highlighted" | "inLineOfSight">): CSSProperties["backgroundColor"] => {
//     if (props.selected) return "purple"
//     if (props.invalid) return "darksalmon"
//     if (props.highlighted) return "violet"
//     if (props.inLineOfSight) return "plum"

//     return "lavender"
// }

const textColor = (opts: Pick<Props, "selected" | "invalid"> & { locked?: boolean }) => match(opts)
    .with({ invalid: true }, () => "crimson")
    .with({ selected: true }, () => "lightpink")
    .with({ locked: true }, () => "darkslateblue")
    .otherwise(() => "purple.500")

const direction = (move: Props["move"]) => (e: React.KeyboardEvent<HTMLInputElement>) =>
    match(e.key)
        .with("ArrowUp", () => { e.preventDefault(); move("up") })
        .with("ArrowDown", () => { e.preventDefault(); move("down") })
        .with("ArrowLeft", () => { e.preventDefault(); move("left") })
        .with("ArrowRight", () => { e.preventDefault(); move("right") })



