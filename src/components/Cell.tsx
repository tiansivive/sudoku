import { GridItem, Input } from "@chakra-ui/react"
import { CSSProperties, useContext, useEffect, useRef } from "react"
import { Point, Value } from "shared/grid"

import styles from './cell.module.css'
import { match } from "ts-pattern"
import { SudokuContext } from "shared/sudoku-context"




type Props = {
    value: Value,
    point: Point,
    update: (val: string) => void,
    select: () => void,
    selected?: boolean,
    active?: boolean,
    invalid?: boolean,
    inLineOfSight?: boolean,
    move: (direction: "up" | "down" | "left" | "right") => void
}


export const Cell: React.FC<Props> = ({ value, point, update, move, active, select, selected, invalid, inLineOfSight }) => {


    const context = useContext(SudokuContext)
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (active) ref.current?.focus()
    }, [active, context.mode])
    return (
        <GridItem
            gridColumnStart={ point.x * 2 + 1 }
            gridRowStart={ point.y * 2 + 1 }
            border={ active ? "3px solid" : "none" }
            borderColor={ active ? "lightpink" : "purple.500" }
            bgColor={ value.colors[0] || bgColor({ selected, invalid, inLineOfSight, active }) }
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="64px"
            w="64px"
            onClick={ select }
            cursor="pointer"
        >
            { match(value.value)
                .with("", () =>
                    <Input
                        className={ styles.noCaret }
                        cursor="pointer"
                        color={ active ? "lightpink" : "purple.500" }
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

                        color={ textColor({ active, invalid, locked: value.locked }) }
                        fontSize="5xl"
                        variant='unstyled'
                        value={ value.value }
                        textAlign="center"
                        onChange={ e => update(e.target.value) }
                        ref={ ref }
                        onKeyDown={ direction(move) }

                    />)
            }
        </GridItem>
    )
}


const bgColor = (props: Pick<Props, "active" | "invalid" | "selected" | "inLineOfSight">): CSSProperties["backgroundColor"] => {
    if (props.active) return "purple"
    if (props.invalid) return "darksalmon"
    if (props.selected) return "violet"
    if (props.inLineOfSight) return "plum"

    return "lavender"
}

const textColor = (opts: Pick<Props, "active" | "invalid"> & { locked?: boolean }) => match(opts)
    .with({ invalid: true }, () => "crimson")
    .with({ active: true }, () => "lightpink")
    .with({ locked: true }, () => "darkslateblue")
    .otherwise(() => "purple.500")

const direction = (move: Props["move"]) => (e: React.KeyboardEvent<HTMLInputElement>) =>
    match(e.key)
        .with("ArrowUp", () => { e.preventDefault(); move("up") })
        .with("ArrowDown", () => { e.preventDefault(); move("down") })
        .with("ArrowLeft", () => { e.preventDefault(); move("left") })
        .with("ArrowRight", () => { e.preventDefault(); move("right") })


