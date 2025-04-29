import { useState, useEffect } from "react";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { useParams, Link } from "react-router-dom";
import { DateTime } from "luxon";

function ClassroomAttendance() {
  const { classId } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(DateTime.now().toISODate());
  const [attendanceData, setAttendanceData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchClassroomDetails();
  }, [classId]);

  useEffect(() => {
    if (classroom) {
      initializeAttendanceData();
    }
  }, [classroom, date]);

  const fetchClassroomDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${HOSTNAME}/s/leader/classrooms/${classId}`);
      setClassroom(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch classroom details:", err);
      setError("ไม่สามารถโหลดข้อมูลห้องเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendanceData = async () => {
    try {
      // You would fetch existing attendance records for the selected date here
      // For now, we'll initialize empty records for each student
      if (classroom?.classroomMembers) {
        const initialAttendance = classroom.classroomMembers.map(member => ({
          studentId: member.stdId,
          studentNo: member.stdNo,
          status: "PRESENT", // Default status
          note: ""
        }));
        setAttendanceData(initialAttendance);
      }
    } catch (error) {
      console.error("Error initializing attendance data:", error);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prevData =>
      prevData.map(item =>
        item.studentId === studentId ? { ...item, status } : item
      )
    );
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceData(prevData =>
      prevData.map(item =>
        item.studentId === studentId ? { ...item, note } : item
      )
    );
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    setSubmitMessage({ type: "", message: "" });
    
    try {
      // Here you would submit the attendance data to your API
      const payload = {
        classId,
        date,
        attendance: attendanceData
      };
      
      await axios.post(`${HOSTNAME}/s/leader/attendance`, payload);
      
      setSubmitMessage({
        type: "success",
        message: "บันทึกข้อมูลการเข้าเรียนสำเร็จ"
      });
    } catch (error) {
      console.error("Failed to submit attendance:", error);
      setSubmitMessage({
        type: "error",
        message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateThai = (dateString) => {
    if (!dateString) return "-";
    
    const date = DateTime.fromISO(dateString);
    return date.setLocale('th').toFormat("d MMMM yyyy");
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
        
        {classroom && (
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h1 className="text-2xl font-bold text-primary">
              บันทึกการเข้าเรียน ม.{classroom.classLevel}/{classroom.classRoom}
            </h1>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">วันที่:</label>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="border rounded-md px-2 py-1 text-sm"
              />
            </div>
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
            onClick={fetchClassroomDetails}
            className="mt-2 text-sm underline"
          >
            ลองอีกครั้ง
          </button>
        </div>
      ) : classroom ? (
        <div>
          {submitMessage.message && (
            <div 
              className={`mb-4 p-3 rounded-md ${
                submitMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {submitMessage.message}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div className="p-4 bg-primary text-white">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">การเข้าเรียนวันที่ {formatDateThai(date)}</h2>
                <span className="bg-white/20 text-white px-2 py-1 rounded-full text-sm">
                  {classroom.classroomMembers?.length || 0} คน
                </span>
              </div>
              <div className="flex gap-4 text-sm flex-wrap">
                <div>
                  <span className="opacity-80">ห้อง:</span>{" "}
                  {classroom.classroomType?.classTypeNameThai || "-"}
                </div>
                <div>
                  <span className="opacity-80">ครูประจำชั้น:</span>{" "}
                  {classroom.teacher && classroom.teacher[0] 
                    ? `${classroom.teacher[0].fName} ${classroom.teacher[0].lName}` 
                    : "ไม่ระบุ"}
                </div>
                <div>
                  <span className="opacity-80">ภาคเรียน:</span>{" "}
                  {classroom.term?.academicYear}/{classroom.term?.semester}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">เลขที่</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">รหัสนักเรียน</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">สถานะการเข้าเรียน</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500 border-b">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {classroom.classroomMembers?.length > 0 ? (
                    classroom.classroomMembers
                      .sort((a, b) => Number(a.stdNo) - Number(b.stdNo))
                      .map((member) => {
                        const studentAttendance = attendanceData.find(a => a.studentId === member.stdId);
                        return (
                          <tr key={member.classRoomMemeberId} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{member.stdNo}</td>
                            <td className="py-3 px-4">{member.stdId}</td>
                            <td className="py-3 px-4">
                              <select
                                value={studentAttendance?.status || "PRESENT"}
                                onChange={(e) => handleStatusChange(member.stdId, e.target.value)}
                                className="border rounded px-2 py-1 text-sm w-full"
                              >
                                <option value="PRESENT">มาเรียน</option>
                                <option value="ABSENT">ขาดเรียน</option>
                                <option value="LATE">มาสาย</option>
                                <option value="LEAVE">ลา</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                placeholder="หมายเหตุ (ถ้ามี)"
                                value={studentAttendance?.note || ""}
                                onChange={(e) => handleNoteChange(member.stdId, e.target.value)}
                                className="border rounded px-2 py-1 text-sm w-full"
                              />
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-500">
                        ไม่พบรายชื่อนักเรียนในห้องเรียนนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={submitAttendance}
              disabled={submitting}
              className={`px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2 ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  บันทึกการเข้าเรียน
                </>
              )}
            </button>
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

export default ClassroomAttendance;