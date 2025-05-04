import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HOSTNAME } from '../../config';
import { formatDateTime } from '../../helper';
import axios from 'axios';

// Helper function to format the date string for activities
const formatActivityDate = (dateStr) => {
  if (!dateStr) return "ไม่พบข้อมูลวันที่";
  
  try {
    const date = new Date(dateStr);
    
    // Format as Thai date
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "ไม่พบข้อมูลวันที่";
  }
};

// Helper function to format time (HH:MM format)
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  return timeStr;
};

const JoinActivityWithLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activityData, setActivityData] = useState(null);

  useEffect(() => {
    const joinActivity = async () => {
      if (!token) {
        setError("ไม่พบข้อมูลกิจกรรม");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${HOSTNAME}/s/activity/join/qr`, 
          { qrToken: token },
        );

        setActivityData(response.data);
        setSuccess(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("หมดเวลาเข้าร่วมกิจกรรม");
        } else if (err.response?.status === 400) {
          setError("ไม่ใช่นักเรียนที่สามารถเข้าร่วมกิจกรรมนี้ได้");
        } else if (err.response?.status === 500 && 
                  (err.response?.data?.message?.name === 'TokenExpiredError' || 
                   (typeof err.response?.data?.message === 'string' && 
                    err.response?.data?.message.includes('jwt expired')))) {
          setError("หมดเวลาเข้าร่วมกิจกรรม - โทเคนหมดอายุ");
        } else {
          setError(err.response?.data?.message?.message || 
                  err.response?.data?.message || 
                  'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
        console.error("Error joining activity:", err);
      } finally {
        setLoading(false);
      }
    };

    joinActivity();
  }, [token]);

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-6 text-primary font-heading">บันทึกการเข้าร่วมกิจกรรม</h2>
        
        {loading && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">กำลังบันทึกการเข้าร่วมกิจกรรม...</p>
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

        {success && activityData && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">บันทึกการเข้าร่วมกิจกรรมเรียบร้อยแล้ว</p>
              </div>
            </div>

            <div className="mt-4 border-t border-green-100 pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">ชื่อกิจกรรม:</p>
                <p className="font-medium">
                  {activityData.activity?.actName}
                </p>
                
                <p className="text-gray-600">รายละเอียด:</p>
                <p className="font-medium">
                  {activityData.activity?.actDesc || "-"}
                </p>
                
                <p className="text-gray-600">สถานที่:</p>
                <p className="font-medium">
                  {activityData.activity?.actLocation || "-"}
                </p>
                
                <p className="text-gray-600">วันที่จัดกิจกรรม:</p>
                <p className="font-medium">
                  {activityData.activity?.actDate ? 
                    formatActivityDate(activityData.activity.actDate) : "-"}
                  {activityData.activity?.actDateEnd ? 
                    ` ถึง ${formatActivityDate(activityData.activity.actDateEnd)}` : ""}
                </p>

                <p className="text-gray-600">เวลา:</p>
                <p className="font-medium">
                  {activityData.activity?.actStartTime ? 
                    `${formatTime(activityData.activity.actStartTime)} - ${formatTime(activityData.activity.actEndTime)}` : "-"}
                </p>
                
                <p className="text-gray-600">สถานะกิจกรรม:</p>
                <p className="font-medium">
                  {activityData.activity?.actStatus === "PROCESSING" ? "กำลังดำเนินการ" : 
                   activityData.activity?.actStatus === "FINISHED" ? "เสร็จสิ้น" : 
                   activityData.activity?.actStatus === "PENDING" ? "รอดำเนินการ" : 
                   activityData.activity?.actStatus}
                </p>
                
                <p className="text-gray-600">สถานะการเข้าร่วม:</p>
                <p className="font-medium text-green-600">เข้าร่วมกิจกรรม</p>
                
                <p className="text-gray-600">เวลาที่เข้าร่วม:</p>
                <p className="font-medium">
                  {activityData.joinTimestamp ? 
                    new Date(activityData.joinTimestamp).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }) : "-"}
                </p>
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

export default JoinActivityWithLink;