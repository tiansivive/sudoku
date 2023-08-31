import { GridItem, Input } from "@chakra-ui/react"



type Props = {
    value: string,
    update: (val: string) => void,
    select: () => void,
    selected?: boolean
}

export const Cell: React.FC<Props> = ({ value, update, select, selected }) => {
    return (
        <GridItem
            bgColor={ selected ? "violet" : "lavender" }
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