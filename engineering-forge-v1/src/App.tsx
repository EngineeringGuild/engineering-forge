import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import GamePage from './pages/GamePage'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  return (
    <Router basename="/v1">
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
