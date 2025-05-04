import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { formatDateToThai, formatTimeThai } from "../../helper";

function Activities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlClassId = searchParams.get('classId');
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch activities when classId changes
  useEffect(() => {
    
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        // Endpoint to fetch activities for a specific classroom
        const response = await axios.get(`${HOSTNAME}/s/leader/activities?classId=${urlClassId}`);
        setActivities(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "ไม่สามารถดึงข้อมูลกิจกรรมได้");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [urlClassId]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-primary">กิจกรรมของชั้นเรียน</h1>
        
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3"> 
          {/* Refresh button */}
          <button 
            onClick={() => {
              if (urlClassId) {
                setLoading(true);
                axios.get(`${HOSTNAME}/s/leader/activities?classId=${urlClassId}`)
                  .then(response => {
                    setActivities(response.data);
                    setError(null);
                  })
                  .catch(err => {
                    setError(err.response?.data?.message || "ไม่สามารถดึงข้อมูลกิจกรรมได้");
                    console.error(err);
                  })
                  .finally(() => setLoading(false));
              }
            }}
            className="px-3 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
            disabled={!urlClassId}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            รีเฟรช
          </button>
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
            onClick={() => {
              if (urlClassId) {
                setLoading(true);
                axios.get(`${HOSTNAME}/s/leader/activities?classId=${urlClassId}`)
                  .then(response => {
                    setActivities(response.data);
                    setError(null);
                  })
                  .catch(err => {
                    setError(err.response?.data?.message || "ไม่สามารถดึงข้อมูลกิจกรรมได้");
                    console.error(err);
                  })
                  .finally(() => setLoading(false));
              }
            }}
            className="mt-2 text-sm underline"
          >
            ลองอีกครั้ง
          </button>
        </div>
      ) : !urlClassId ? (
        <div className="bg-yellow-50 p-8 rounded-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">ไม่พบห้องเรียนที่คุณเป็นหัวหน้า</h3>
          <p className="mt-1 text-sm text-gray-500">
            คุณต้องได้รับการแต่งตั้งเป็นหัวหน้าห้องก่อนจึงจะสามารถเข้าถึงกิจกรรมห้องเรียนได้
          </p>
        </div>
      ) : activities.length === 0 ? (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">ไม่พบกิจกรรม</h3>
          <p className="mt-1 text-sm text-gray-500">
            ยังไม่มีกิจกรรมสำหรับห้องเรียนนี้
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <div
              key={activity.actId}
              className="bg-white rounded-lg shadow-md border border-line overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-4 bg-primary text-white">
                <h2 className="font-bold text-lg">{activity.actName}</h2>
                <p className="text-sm text-white/70">{activity.actDescription}</p>
              </div>
              
              <div className="p-4">
                <div className="space-y-3 mb-4">
                  {/* Date */}
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{formatDateToThai(activity.actDate)}</span>
                    {activity.actDateEnd && activity.actDate !== activity.actDateEnd && (
                      <span className="text-gray-700"> - {formatDateToThai(activity.actDateEnd)}</span>
                    )}
                  </div>
                  
                  {/* Time */}
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{formatTimeThai(activity.actStartTime)} - {formatTimeThai(activity.actEndTime)} น.</span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{activity.actLocation || "ไม่ระบุสถานที่"}</span>
                  </div>
                
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Link
                    to={`/leader/activities/${activity.actId}`}
                    className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-center flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    รายละเอียด
                  </Link>
                  <Link
                    to={`/leader/checkin/${activity.actId}?classId=${urlClassId}`}
                    className="w-full py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors text-center flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    เช็คชื่อ
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Activities;