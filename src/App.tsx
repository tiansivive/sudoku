
import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { Board } from 'components/Board'
import { SudokuProvider } from 'shared/sudoku-context'


function App() {

  return (
    <ChakraProvider>
      <SudokuProvider>
        <Board size={ { x: SIZE, y: SIZE } } />
      </SudokuProvider>

    </ChakraProvider>
  )
}

export default App


const SIZE = 9


