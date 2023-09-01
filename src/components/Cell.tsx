import { GridItem, Input } from "@chakra-ui/react"
import { CSSProperties } from "react"
import { Point } from "../shared/grid"
import { REGION_SIDE_SIZE } from "./Board"



type Props = {
    value: string,
    point: Point,
    update: (val: string) => void,
    select: () => void,
    selected?: boolean,
    invalid?: boolean,
    inLineOfSight?: boolean
}

export const Cell: React.FC<Props> = ({ value, point, update, select, selected, invalid, inLineOfSight }) => {


    return (
        <GridItem
            gridColumnStart={ point.x * 2 + 1 }
            gridRowStart={ point.y * 2 + 1 }
            bgColor={ bgColor({ selected, invalid, inLineOfSight }) }
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="64px"
            w="64px"
            onClick={ select }
            cursor="pointer"
        >
            <Input
                cursor="pointer"
                color="mediumpurple"
                fontSize="5xl"
                variant='unstyled'
                value={ value }
                textAlign="center"
                onChange={ e => update(e.target.value) }

            />
        </GridItem>
    )
}


const bgColor = (props: Pick<Props, "invalid" | "selected" | "inLineOfSight">): CSSProperties["backgroundColor"] => {
    if (props.invalid) return "coral"
    if (props.selected) return "violet"
    if (props.inLineOfSight) return "plum"

    return "lavender"
}

