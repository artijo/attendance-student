import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
<<<<<<< Updated upstream
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
=======
import { BrowserRouter, Routes, Route } from "react-router";
import AttendenceHistory from './pages/AttendenceHistory/AttendenceHistory.jsx';
import AttendenceByDaySummarizeDetail from './pages/AttendenceHistory/Page/AttendenceByDaySummarizeDetail.jsx';
import AttendenceBySubjectSumarizeDetail from './pages/AttendenceHistory/Page/AttendenceBySubjectSumarizeDetail.jsx';
import ActivityMainPage from './pages/activity/ActivityMainPage.jsx';
>>>>>>> Stashed changes

// Lazy load components
const Login = lazy(() => import('./pages/Login.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const StudentAttendence = lazy(() => import('./pages/Attendence/StudentAttendence.jsx'))
const AttendanceWithLink = lazy(() => import('./pages/Attendence/AttendanceWithLink.jsx'))
const LeaveRequest = lazy(() => import('./pages/leaverequest/LeaveRequest.jsx'))
const CreateLeaveRequest = lazy(() => import('./pages/leaverequest/CreateLeaveRequest.jsx'))
const LeaveRequestDetail = lazy(() => import('./pages/leaverequest/LeaveRequestDetail.jsx'))
const Classrooms = lazy(() => import('./pages/leader/Classrooms.jsx'))
const ClassroomMembers = lazy(() => import('./pages/leader/ClassroomMembers.jsx'))
const ClassroomTimetable = lazy(() => import('./pages/leader/ClassroomTimetable.jsx'))
const Attendance = lazy(() => import('./pages/leader/Attendance.jsx'))
const Activities = lazy(() => import('./pages/leader/Activities.jsx'))
const ActivityDetail = lazy(() => import('./pages/leader/ActivityDetail.jsx'))
const CheckIn = lazy(() => import('./pages/leader/CheckIn.jsx'))
const JoinActivityWithLink = lazy(() => import('./pages/activity/JoinActivityWithLink.jsx'))
const AttendenceHistory = lazy(() => import('./pages/AttendenceHistory/AttendenceHistory.jsx'));
const AttendenceByDaySummarizeDetail = lazy(() => import('./pages/AttendenceHistory/Page/AttendenceByDaySummarizeDetail.jsx'));
const AttendenceBySubjectSumarizeDetail = lazy(() => import('./pages/AttendenceHistory/Page/AttendenceBySubjectSumarizeDetail.jsx'));

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
          <Route path="login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/" element={<App />} >
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='attendence' element={<StudentAttendence/>}/>
          <Route path='attendance/qr/:token' element={<AttendanceWithLink />} />
          <Route path='activity' element={<ActivityMainPage/>}/>
          <Route path='activity/qr/:token' element={<JoinActivityWithLink />} />
          <Route path='history' element={<AttendenceHistory/>}/>
          <Route path='history/datedetail' element={<AttendenceByDaySummarizeDetail/>}/>
          <Route path='history/subjectdetail' element={<AttendenceBySubjectSumarizeDetail/>}/>
          <Route path='leavereq' element={<LeaveRequest />}/>
          <Route path='leavereq/create' element={<CreateLeaveRequest />}/>
          <Route path='leavereq/:id' element={<LeaveRequestDetail />}/>
          <Route path='leader/classrooms' element={<Classrooms />}/>
          <Route path='leader/classrooms/:classId/members' element={<ClassroomMembers />}/>
          <Route path='leader/classrooms/:classId/timetable' element={<ClassroomTimetable />}/>
          <Route path='leader/attendance/:studingid' element={<Attendance />}/>
          <Route path='leader/activities' element={<Activities />} />
          <Route path='leader/activities/:id' element={<ActivityDetail />} />
          <Route path='leader/checkin/:id' element={<CheckIn />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>,
)
