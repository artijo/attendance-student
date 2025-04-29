import { useState, useEffect } from "react";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { Link } from "react-router-dom";

function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${HOSTNAME}/s/leader/classrooms`);
      setClassrooms(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
      setError("ไม่สามารถโหลดข้อมูลห้องเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  const formatTerm = (termData) => {
    if (!termData) return "-";
    
    const year = termData.academicYear + 543;
    const semester = termData.semester;
    
    return `${year}/${semester}`;
  };

  const formatDateThai = (dateString) => {
    if (!dateString) return "-";
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    
    // Add 543 to convert to Buddhist Era (BE)
    const thaiYear = date.getFullYear() + 543;
    
    return date.toLocaleDateString('th-TH', { ...options, year: 'numeric' })
      .replace(date.getFullYear(), thaiYear);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">ห้องเรียนที่เป็นหัวหน้า</h1>
        <button 
          onClick={fetchClassrooms}
          className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          รีเฟรช
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchClassrooms}
            className="mt-2 text-sm underline"
          >
            ลองอีกครั้ง
          </button>
        </div>
      ) : classrooms.length === 0 ? (
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">ไม่พบห้องเรียน</h3>
          <p className="mt-2 text-gray-500">
            คุณไม่มีห้องเรียนที่เป็นหัวหน้าในขณะนี้
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((classroom) => (
            <div
              key={classroom.classId}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-line hover:shadow-lg transition-shadow"
            >
              <div className="bg-primary p-4">
                <h2 className="text-lg font-bold text-white">ม.{classroom.classLevel}/{classroom.classRoom}</h2>
                <p className="text-sm text-white/80">
                  {classroom.classroomType?.classTypeNameThai || "-"} • {formatTerm(classroom.term)}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span className="text-gray-700">
                    จำนวนนักเรียน: {classroom.classroomMembers?.length || 0} คน
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.035-.691-.1-1.02A4.978 4.978 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    ครูประจำชั้น: {classroom.teacher && classroom.teacher[0] 
                      ? `${classroom.teacher[0].fName} ${classroom.teacher[0].lName}` 
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
                    ภาคเรียน: {formatDateThai(classroom.term?.termStart)} - {formatDateThai(classroom.term?.termEnd)}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-2">   
                  <Link
                    to={`/leader/classrooms/${classroom.classId}/timetable`}
                    className="w-full py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-center flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    ดูตารางเรียนทั้งหมด
                  </Link>
                  
                  <Link
                    to={`/leader/classrooms/${classroom.classId}/members`}
                    className="w-full py-2 bg-secondary text-white rounded-md hover:bg-secondary/80 transition-colors text-center flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    ดูรายชื่อนักเรียนในห้อง
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

export default Classrooms;