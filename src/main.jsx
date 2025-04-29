import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router";

// Lazy load components
const Login = lazy(() => import('./pages/Login.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const StudentAttendence = lazy(() => import('./pages/Attendence/StudentAttendence.jsx'))
// const StudentAttendence = lazy(() => import('./pages/student/StudentAttendence.jsx').then(module => ({ default: module.StudentAttendence })))
// const StudentAttendenceHistory = lazy(() => import('./pages/student/StudentAttendenceHistory.jsx').then(module => ({ default: module.StudentAttendenceHistory })))
const LeaveRequest = lazy(() => import('./pages/leaverequest/LeaveRequest.jsx'))
const CreateLeaveRequest = lazy(() => import('./pages/leaverequest/CreateLeaveRequest.jsx'))
const LeaveRequestDetail = lazy(() => import('./pages/leaverequest/LeaveRequestDetail.jsx'))

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="login" element={<Login />} />
          <Route path="/" element={<App />} >
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='attendence' element={<StudentAttendence/>}/>
          {/* <Route path='attendenceSubjectHistory' element={<StudentAttendenceHistory/>}/>
          <Route path='attendenceSubject' element={<StudentAttendence/>}/> */}
          <Route path='leavereq' element={<LeaveRequest />}/>
          <Route path='leavereq/create' element={<CreateLeaveRequest />}/>
          <Route path='leavereq/:id' element={<LeaveRequestDetail />}/>


          
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>,
  // </StrictMode>,
)
