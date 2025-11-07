import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BoardsApp from './components/Boards'
import Login from './components/Login'
import { Link } from 'react-router-dom'

function App() {
  

  return (
    <>
      {/* <BoardsApp/> */}
      first login 
      <Link to ='/login' >Login </Link>
    </>
  )
}

export default App
