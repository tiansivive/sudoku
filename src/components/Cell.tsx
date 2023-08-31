import { GridItem, Input } from "@chakra-ui/react"



type Props = {
    value: string,
    update: (val: string) => void,
}

export const Cell: React.FC<Props> = ({ value, update }) => {
    return (
        <GridItem
            bgColor="lavender"
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="5vw"
            w="5vw"
        >
            <Input
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