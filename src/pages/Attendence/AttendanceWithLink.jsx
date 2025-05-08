import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HOSTNAME } from '../../config';
import { formatDateTime } from '../../helper';
import axios from 'axios';

// Helper function to format the datetime string specifically for the attendance API response
const formatAttendanceTime = (datetimeStr) => {
  if (!datetimeStr) return "ไม่พบข้อมูลเวลา";
  
  try {
    // Handle the specific format: "YYYY-MM-DD HH:MM:SS"
    const [datePart, timePart] = datetimeStr.split(' ');
    if (!datePart || !timePart) return formatDateTime(datetimeStr); // Fallback to general formatter
    
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split(':');
    
    const date = new Date(year, month-1, day, hour, minute, second);
    
    // Format as Thai date
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (e) {
    console.error("Error formatting datetime:", e);
    return formatDateTime(datetimeStr); // Fallback to general formatter
  }
};

const AttendanceWithLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    const recordAttendance = async () => {
      if (!token) {
        setError("ไม่พบข้อมูลการเช็คชื่อ");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${HOSTNAME}/s/attendance/qr`, 
          { qrToken: token },
        );

        setAttendanceData(response.data);
        setSuccess(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("หมดเวลาเช็คชื่อ");
        } else if (err.response?.status === 400) {
          setError("ไม่ใช่นักเรียนที่สามารถเช็คชื่อวิชานี้ได้");
        } else if (err.response?.status === 500 && 
                  (err.response?.data?.message?.name === 'TokenExpiredError' || 
                   (typeof err.response?.data?.message === 'string' && 
                    err.response?.data?.message.includes('jwt expired')))) {
          setError("หมดเวลาเช็คชื่อ - โทเคนหมดอายุ");
        } else {
          setError(err.response?.data?.message?.message || 
                  err.response?.data?.message || 
                  'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
        console.error("Error recording attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    recordAttendance();
  }, [token]);

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6 text-primary font-heading">บันทึกการเข้าเรียน</h2>
        
        {loading && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">กำลังบันทึกการเข้าเรียน...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && attendanceData && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 00-1.414 1.414l2 2a1 1 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">บันทึกการเข้าเรียนเรียบร้อยแล้ว</p>
              </div>
            </div>

            <div className="mt-4 border-t border-green-100 pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">วิชา:</p>
                <p className="font-medium">
                  {attendanceData.studyTime?.timetable?.subject?.subNameThai} 
                  ({attendanceData.studyTime?.timetable?.subject?.subNameEng})
                </p>
                
                <p className="text-gray-600">คุณครู:</p>
                <p className="font-medium">
                  {`${attendanceData.studyTime?.timetable?.subject?.teacher?.fName} ${attendanceData.studyTime?.timetable?.subject?.teacher?.lName}`}
                </p>
                
                <p className="text-gray-600">ห้องเรียน:</p>
                <p className="font-medium">
                  {`ม.${attendanceData.studyTime?.timetable?.classroom?.classLevel}/${attendanceData.studyTime?.timetable?.classroom?.classRoom}`}
                </p>
                
                <p className="text-gray-600">เวลาเข้าเรียน:</p>
                <p className="font-medium">
                  {attendanceData.attendanceTime ? 
                    formatAttendanceTime(attendanceData.attendanceTime) : 
                    "ไม่พบข้อมูลเวลา"}
                </p>
                
                <p className="text-gray-600">สถานะ:</p>
                <p className="font-medium text-green-600">เข้าเรียน</p>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleGoBack} 
          className="w-full bg-secondary hover:bg-accent text-white py-2 px-4 rounded-md transition duration-200"
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
};

export default AttendanceWithLink;