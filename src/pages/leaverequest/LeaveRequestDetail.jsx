import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { useParams, useNavigate } from "react-router";

function LeaveRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaveRequest, setLeaveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveRequestDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${HOSTNAME}/leave/${id}`);
        setLeaveRequest(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch leave request details:", err);
        setError("ไม่สามารถโหลดข้อมูลคำร้องขอลาได้");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLeaveRequestDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const dt = DateTime.fromISO(dateString);
    return dt.toFormat("dd/MM/yyyy");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const dt = DateTime.fromISO(dateString);
    return dt.toFormat("dd/MM/yyyy HH:mm น.");
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

  // Map status to Thai and return with proper styling
  const getStatusDisplay = (status) => {
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
      case "CANCELED":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            ยกเลิกแล้ว
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/leavereq")}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-primary"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-primary">รายละเอียดคำร้องขอลา</h1>
      </div>

      <div className="bg-white rounded-lg border border-line shadow-sm p-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-text-color-alt">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">
            <p>{error}</p>
            <div className="mt-4">
              <button
                onClick={() => navigate("/leavereq")}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
              >
                กลับไปหน้ารายการ
              </button>
            </div>
          </div>
        ) : leaveRequest ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <div className="bg-gray-50 p-4 rounded-lg border border-line">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg">
                      {getLeaveTypeName(leaveRequest.leaveTypeId)}
                    </h3>
                    {getStatusDisplay(leaveRequest.leaveStatus)}
                  </div>
                  <p className="text-sm text-text-color-alt mt-2">
                    หมายเลขคำร้อง: {leaveRequest.leaveId?.substring(0, 8) || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">วันที่ลา</h4>
                <p className="text-text-color-alt">{formatDate(leaveRequest.leaveDate)}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">วันที่ส่งคำร้อง</h4>
                <p className="text-text-color-alt">{formatDateTime(leaveRequest.createdAt)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">เหตุผลในการลา</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-line">
                <p className="text-text-color">
                  {leaveRequest.leaveReason || "ไม่ได้ระบุเหตุผล"}
                </p>
              </div>
            </div>

            {leaveRequest.leaveFile && (
              <div>
                <h4 className="font-medium mb-2">ไฟล์แนบ</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-line flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href={leaveRequest.leaveFile}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    ดาวน์โหลด
                  </a>
                </div>
              </div>
            )}

            {(leaveRequest.leaveStatus === "APPROVED" || leaveRequest.leaveStatus === "REJECTED") && (
              <div>
                <h4 className="font-medium mb-2">ข้อมูลการอนุมัติ</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-line space-y-2">
                  <p>
                    <span className="text-text-color-alt">ผู้อนุมัติ: </span>
                    <span className="text-text-color">
                      {leaveRequest.approver?.name || "ไม่ระบุ"}
                    </span>
                  </p>
                  <p>
                    <span className="text-text-color-alt">เวลาอนุมัติ: </span>
                    <span className="text-text-color">
                      {formatDateTime(leaveRequest.approverTimestamp)}
                    </span>
                  </p>
                  {leaveRequest.approverComment && (
                    <p>
                      <span className="text-text-color-alt">ความคิดเห็น: </span>
                      <span className="text-text-color">{leaveRequest.approverComment}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {leaveRequest.leaveStatus === "WAITING" && (
              <div className="border-t pt-4 mt-4">
                <button 
                  onClick={async () => {
                    try {
                      await axios.put(`${HOSTNAME}/leave/${leaveRequest.leaveId}`, {
                        leaveStatus: "CANCELED",
                      });
                      navigate("/leavereq");
                    } catch (error) {
                      console.error("Error canceling leave request:", error);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  ยกเลิกคำขอ
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
            <p>ไม่พบข้อมูลคำร้องขอลา</p>
            <div className="mt-4">
              <button
                onClick={() => navigate("/leavereq")}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
              >
                กลับไปหน้ารายการ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveRequestDetail;