import { useState, useEffect } from "react";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { DateTime } from "luxon";
import { useNavigate } from "react-router";

function LeaveRequestListItem({ leaveRequest, onRefresh }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const dt = DateTime.fromISO(dateString);
    return dt.toFormat("dd/MM/yyyy");
  };

  // Get leave type name from the leaveRequestType object
  const getLeaveTypeName = () => {
    return leaveRequest.leaveRequestType?.leaveTypeName || "ไม่ระบุประเภท";
  };

  return (
    <div className="bg-white border border-line rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h3 className="font-medium text-primary">
            {getLeaveTypeName()}
          </h3>
          <p className="text-sm text-text-color-alt mt-1">
            วันที่ลา: {formatDate(leaveRequest.leaveDate)}
          </p>
          <p className="text-sm text-text-color mt-2">
            เหตุผล: {leaveRequest.leaveReason?.substring(0, 80) || "-"}
            {leaveRequest.leaveReason?.length > 80 ? "..." : ""}
          </p>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => navigate(`/leavereq/${leaveRequest.leaveId}`)}
            className="text-sm text-blue-500 hover:underline"
          >
            ดูรายละเอียด
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${HOSTNAME}/s/leave`);
      // Sort the leave requests by createdAt in descending order (newest first)
      const sortedRequests = [...(response.data || [])].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setLeaveRequests(sortedRequests);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
      setError("ไม่สามารถโหลดข้อมูลคำร้องขอลาได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">คำร้องขอลา</h1>
          <p className="text-sm text-text-color-alt">
            รายการคำร้องขอลาทั้งหมดของคุณ
          </p>
        </div>

        <button
          onClick={() => navigate("/leavereq/create")}
          className="mt-4 md:mt-0 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          ส่งคำร้องขอลา
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-text-color-alt">กำลังโหลดข้อมูล...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchLeaveRequests}
            className="mt-2 text-sm underline"
          >
            ลองอีกครั้ง
          </button>
        </div>
      ) : leaveRequests.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-text-color">
            ไม่พบข้อมูลคำร้องขอลา
          </h3>
          <p className="mt-1 text-text-color-alt">
            คุณยังไม่มีคำร้องขอลา กดปุ่ม 'ส่งคำร้องขอลา' เพื่อเริ่มต้น
          </p>
        </div>
      ) : (
        <div>
          {leaveRequests.map((leaveRequest) => (
            <LeaveRequestListItem
              key={leaveRequest.leaveId}
              leaveRequest={leaveRequest}
              onRefresh={fetchLeaveRequests}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default LeaveRequest;