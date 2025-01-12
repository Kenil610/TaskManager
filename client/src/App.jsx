import { useState } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import Header from './components/Header/Header'

function App() {

  return (
    <>
    <Header />
      <div>
        <Outlet />
      </div>
    </>
  )
}

export default App
