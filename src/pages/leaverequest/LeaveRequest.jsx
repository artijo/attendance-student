import { useState, useEffect } from "react";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { DateTime } from "luxon";
import { userStore } from "../../store";
import { useNavigate } from "react-router";

function LeaveRequestListItem({ leaveRequest, onRefresh }) {
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`${HOSTNAME}/s/leave/${leaveRequest.leaveId}`, {
        leaveStatus: newStatus,
      });
      onRefresh();
    } catch (error) {
      console.error("Error updating leave request status:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const dt = DateTime.fromISO(dateString);
    return dt.toFormat("dd/MM/yyyy");
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "WAITING":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            รอการอนุมัติ
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            อนุมัติแล้ว
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            ไม่อนุมัติ
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Map leave type IDs to Thai names
  const getLeaveTypeName = (typeId) => {
    const typeMap = {
      "SICK": "ลาป่วย",
      "PERSONAL": "ลากิจ",
      "OTHER": "อื่นๆ"
    };
    return typeMap[typeId] || typeId || "ไม่ระบุประเภท";
  };

  return (
    <div className="bg-white border border-line rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h3 className="font-medium text-primary">
            {getLeaveTypeName(leaveRequest.leaveTypeId)}
          </h3>
          <p className="text-sm text-text-color-alt mt-1">
            วันที่ลา: {formatDate(leaveRequest.leaveDate)}
          </p>
          <p className="text-sm text-text-color mt-2">
            เหตุผล: {leaveRequest.leaveReason?.substring(0, 80) || "-"}
            {leaveRequest.leaveReason?.length > 80 ? "..." : ""}
          </p>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div>{getStatusBadge(leaveRequest.leaveStatus)}</div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/leavereq/${leaveRequest.leaveId}`)}
              className="text-sm text-blue-500 hover:underline"
            >
              ดูรายละเอียด
            </button>
            
            {leaveRequest.leaveStatus === "WAITING" && (
              <button 
                onClick={() => handleStatusChange("CANCELED")}
                className="text-sm text-red-500 hover:underline"
              >
                ยกเลิกคำขอ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    
    setLoading(true);
    try {
      const response = await axios.get(`${HOSTNAME}/s/leave`);
      setLeaveRequests(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
      setError("ไม่สามารถโหลดข้อมูลคำร้องขอลาได้");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaveRequests = () => {
    if (filter === "all") return leaveRequests;
    return leaveRequests.filter((request) => request.leaveStatus === filter);
  };

  return (
    <div className="container mx-auto px-4 py-6">
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

      <div className="bg-white p-4 rounded-lg border border-line mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-text-color hover:bg-gray-200"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilter("WAITING")}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === "WAITING"
                ? "bg-primary text-white"
                : "bg-gray-100 text-text-color hover:bg-gray-200"
            }`}
          >
            รอการอนุมัติ
          </button>
          <button
            onClick={() => setFilter("APPROVED")}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === "APPROVED"
                ? "bg-primary text-white"
                : "bg-gray-100 text-text-color hover:bg-gray-200"
            }`}
          >
            อนุมัติแล้ว
          </button>
          <button
            onClick={() => setFilter("REJECTED")}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === "REJECTED"
                ? "bg-primary text-white"
                : "bg-gray-100 text-text-color hover:bg-gray-200"
            }`}
          >
            ไม่อนุมัติ
          </button>
        </div>
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
      ) : filteredLeaveRequests().length === 0 ? (
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
            {filter === "all"
              ? "คุณยังไม่มีคำร้องขอลา กดปุ่ม 'ส่งคำร้องขอลา' เพื่อเริ่มต้น"
              : `ไม่พบคำร้องสถานะ ${filter} ลองเลือกตัวกรองอื่น`}
          </p>
        </div>
      ) : (
        <div>
          {filteredLeaveRequests().map((leaveRequest) => (
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