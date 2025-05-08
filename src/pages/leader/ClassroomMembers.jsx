import { useState, useEffect } from "react";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { useParams, Link } from "react-router-dom";
import { formatTitle } from "../../helper";

function ClassroomMembers() {
  const { classId } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classInfo, setClassInfo] = useState(null);

  useEffect(() => {
    fetchClassroomMembers();
  }, [classId]);

  const fetchClassroomMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${HOSTNAME}/s/leader/classrooms/${classId}/members`);
      setMembers(response.data || []);
      
      // Set classroom info from the first member's data (all members have the same classroom)
      if (response.data && response.data.length > 0) {
        setClassInfo(response.data[0].classroom);
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch classroom members:", err);
      setError("ไม่สามารถโหลดข้อมูลนักเรียนในห้องเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTerm = () => {
    if (!classInfo || !classInfo.term) return "";
    return `${classInfo.term.academicYear}/${classInfo.term.semester}`;
  };

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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">
              รายชื่อนักเรียนชั้น ม.{classInfo.classLevel}/{classInfo.classRoom}
            </h1>
            <button 
              onClick={fetchClassroomMembers}
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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchClassroomMembers}
            className="mt-2 text-sm underline"
          >
            ลองอีกครั้ง
          </button>
        </div>
      ) : classInfo ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-primary text-white">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">ห้อง {classInfo.classroomType?.classTypeNameThai || "-"}</h2>
              <span className="bg-white/20 text-white px-2 py-1 rounded-full text-sm">
                {members.length} คน
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="opacity-80">ครูประจำชั้น:</span>{" "}
                {classInfo.teacher && classInfo.teacher[0] 
                  ? `${classInfo.teacher[0].fName} ${classInfo.teacher[0].lName}` 
                  : "ไม่ระบุ"}
              </div>
              <div>
                <span className="opacity-80">ภาคเรียน:</span>{" "}
                {getCurrentTerm()}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">เลขที่</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">รหัสนักเรียน</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">อีเมล</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">เบอร์โทร</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">คะแนนความประพฤติ</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? (
                  members.sort((a, b) => Number(a.stdNo) - Number(b.stdNo)).map((member) => (
                    <tr key={member.classRoomMemeberId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{member.stdNo}</td>
                      <td className="py-3 px-4">{member.stdId}</td>
                      <td className="py-3 px-4">
                        {member.student && (
                          <span>
                            {formatTitle(member.student.title)}{member.student.fName} {member.student.lName}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {member.student?.email || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {member.student?.tel || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          member.behaviourScore >= 90 ? "bg-green-100 text-green-800" :
                          member.behaviourScore >= 70 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {member.behaviourScore}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                      ไม่พบรายชื่อนักเรียนในห้องเรียนนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-900">ไม่พบข้อมูลห้องเรียน</h3>
          <p className="mt-2 text-gray-500">
            ไม่สามารถโหลดข้อมูลห้องเรียนได้ กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
      )}
    </div>
  );
}

export default ClassroomMembers;