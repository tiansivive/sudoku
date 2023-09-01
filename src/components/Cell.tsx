import { GridItem, Input } from "@chakra-ui/react"
import { CSSProperties } from "react"



type Props = {
    value: string,
    update: (val: string) => void,
    select: () => void,
    selected?: boolean,
    invalid?: boolean,
    inLineOfSight?: boolean
}

export const Cell: React.FC<Props> = ({ value, update, select, selected, invalid, inLineOfSight }) => {
    return (
        <GridItem
            bgColor={ bgColor({ selected, invalid, inLineOfSight }) }
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="5vw"
            w="5vw"
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