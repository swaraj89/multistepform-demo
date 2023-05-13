import {ChakraProvider} from '@chakra-ui/react'
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <ChakraProvider>
      
    </ChakraProvider>
  )
}

export default App
