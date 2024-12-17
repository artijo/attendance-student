import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router";

// import pages
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
// import AdminSearch from './pages/AdminSearch.jsx';
import InformationPerson from './pages/InformationStudent.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
          <Route path="/" element={<App />} >
          <Route path='dashboard' element={<Dashboard />} />
        </Route>
        {/* <Route path="/searchBarTest" element={<AdminSearch/>}></Route> */}
        <Route path="/infomationtest" element={<InformationPerson person_uuid={"60070001"}/>}></Route>
      </Routes>
  </BrowserRouter>,
  // </StrictMode>,
)
