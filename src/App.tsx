
import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { Board } from './components/Board'


function App() {

  return (
    <ChakraProvider>

      <Board size={ { x: SIZE, y: SIZE } } />

    </ChakraProvider>
  )
}

export default App


const SIZE = 9


