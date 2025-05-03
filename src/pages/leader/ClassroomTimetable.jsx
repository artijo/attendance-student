import { useState, useEffect } from "react";
import axios from "axios";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { useParams, Link } from "react-router-dom";
import { DateTime } from "luxon";

function ClassroomTimetable() {
  const { classId } = useParams();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(DateTime.now().setZone(TIME_ZONE));

  useEffect(() => {
    fetchTimetable();
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentDateTime(DateTime.now().setZone(TIME_ZONE));
    }, 60000);
    
    return () => clearInterval(timer);
  }, [classId]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${HOSTNAME}/s/leader/classrooms/${classId}/timetable`);
      
      // Sort the timetable entries by time start 
      const sortedTimetable = (response.data || []).sort((a, b) => {
        return a.timeStart.localeCompare(b.timeStart);
      });
      
      setTimetable(sortedTimetable);
      
      // Set classroom info from the first timetable entry if available
      if (sortedTimetable.length > 0) {
        setClassInfo(sortedTimetable[0].classroom);
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch timetable:", err);
      setError("ไม่สามารถโหลดข้อมูลตารางเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    
    // Convert time string (HH:MM:SS) to formatted time (HH:MM)
    return timeString.substring(0, 5);
  };

  const isCurrentlyInClass = (timeStart, timeEnd) => {
    if (!timeStart || !timeEnd) return false;
    
    const now = currentDateTime;
    const currentTime = now.toFormat("HH:mm");
    
    // Return true if current time is between class start and end time
    return currentTime >= timeStart.substring(0, 5) && currentTime <= timeEnd.substring(0, 5);
  };
  
  const isToday = (studyTimeDates) => {
    const today = currentDateTime.toISODate();
    
    return studyTimeDates.some(studyTime => {
      const studyDate = DateTime.fromISO(studyTime.studingTimeDate).toISODate();
      return studyDate === today;
    });
  };

  const getWeekdayName = (dayOfWeek) => {
    const weekdays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
    // Convert from 0-6 (Sunday-Saturday) to correct index
    return weekdays[dayOfWeek % 7];
  };
  
  const isClassToday = (subject) => {
    if (!subject.studyTime || subject.studyTime.length === 0) return false;
    
    // Get today's date
    const todayDate = currentDateTime.toISODate();
    
    // Check if any study time date matches today
    return subject.studyTime.some(time => {
      const studyDate = DateTime.fromISO(time.studingTimeDate).toISODate();
      return studyDate === todayDate;
    });
  };

  const formatDate = (date) => {
    return date.setLocale("th").toFormat("d MMMM yyyy");
  };

  // Filter timetable to show only today's subjects
  const todayTimetable = timetable.filter(entry => isClassToday(entry));

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link 
          to="/leader/classrooms" 
          className="text-primary hover:underline flex items-center gap-1 mb-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          กลับไปหน้ารายการห้องเรียน
        </Link>
        
        {classInfo && (
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h1 className="text-2xl font-bold text-primary">
              วิชาที่เรียนวันนี้ ม.{classInfo.classLevel}/{classInfo.classRoom}
            </h1>
            <button 
              onClick={fetchTimetable}
              className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              รีเฟรช
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-4 bg-gray-50 p-4 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-gray-700">
            <span className="font-medium">วันที่</span> {formatDate(currentDateTime)}
          </p>
          <p className="text-gray-500 text-sm">
            เวลาปัจจุบัน: {currentDateTime.toFormat("HH:mm น.")}
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchTimetable}
            className="mt-2 text-sm underline"
          >
            ลองอีกครั้ง
          </button>
        </div>
      ) : todayTimetable.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">ไม่พบรายวิชาที่เรียนในวันนี้</h3>
          <p className="mt-2 text-gray-500">
            ไม่มีรายวิชาที่เรียนในวันนี้ หรือตารางเรียนอาจยังไม่ได้ถูกกำหนด
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayTimetable.map((entry) => {
            const isActive = isCurrentlyInClass(entry.timeStart, entry.timeEnd);
            
            return (
              <div
                key={entry.timetableId}
                className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                  isActive ? "border-green-500" : "border-gray-200"
                }`}
              >
                <div className={`p-4 ${isActive ? "bg-green-500" : "bg-primary"} text-white`}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">
                      {entry.subject.subCode} - {entry.subject.subNameThai}
                    </h2>
                    {isActive && (
                      <span className="bg-white text-green-500 px-2 py-1 rounded-full text-xs font-medium">
                        เรียนอยู่ขณะนี้
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/80 mt-1">{entry.subject.subNameEng || "-"}</p>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      {formatTime(entry.timeStart)} - {formatTime(entry.timeEnd)} น. 
                      <span className="text-gray-500 text-xs ml-2">(สาย {formatTime(entry.timeLate)} น.)</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    <span className="text-gray-700">
                      ครูผู้สอน: {entry.subject.teacher 
                        ? `${entry.subject.teacher.fName} ${entry.subject.teacher.lName}` 
                        : "ไม่ระบุ"}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      วันเรียน: ทุกวัน{getWeekdayName(entry.dayOfWeek)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      หน่วยกิต: {entry.subject.subCredit || "-"}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <Link
                      to={`/leader/attendance/${entry.studyTime[0].studyTimeId}`}
                      className={`w-full py-2 text-center rounded-md inline-block ${
                        isActive 
                          ? "bg-green-500 text-white hover:bg-green-600" 
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      } transition-colors`}
                      onClick={(e) => {
                        if (!isActive) e.preventDefault();
                      }}
                    >
                      {isActive ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 inline-block mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          บันทึกการเข้าเรียน
                        </>
                      ) : (
                        "ไม่อยู่ในเวลาเรียน"
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ClassroomTimetable;