import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// import pages
import Login from './pages/Login.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} >
          <Route index element={<Login />} />
        </Route>
      </Routes>
    </Router>
  // </StrictMode>,
)
