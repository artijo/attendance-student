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
const Classrooms = lazy(() => import('./pages/leader/Classrooms.jsx'))
const ClassroomMembers = lazy(() => import('./pages/leader/ClassroomMembers.jsx'))
const ClassroomTimetable = lazy(() => import('./pages/leader/ClassroomTimetable.jsx'))
const Attendance = lazy(() => import('./pages/leader/Attendance.jsx'))

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
          <Route path='leader/classrooms' element={<Classrooms />}/>
          <Route path='leader/classrooms/:classId/members' element={<ClassroomMembers />}/>
          <Route path='leader/classrooms/:classId/timetable' element={<ClassroomTimetable />}/>
          <Route path='leader/attendance/:studingid' element={<Attendance />}/>
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>,
  // </StrictMode>,
)
