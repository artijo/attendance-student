import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router";

// import pages
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
      <Routes>
      <Route path="login" element={<Login />} />
        <Route path="/" element={<App />} >
          <Route path='dashboard' element={<Dashboard />} />
        </Route>
      </Routes>
  </BrowserRouter>,
  // </StrictMode>,
)
