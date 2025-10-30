import { useEffect, useState } from "react";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { useParams, useNavigate } from "react-router";
import {
  formatTitle,
  formatThaiDate,
  formatDateTime,
  formatThaiDateTime,
} from "../../helper";

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
        const response = await axios.get(`${HOSTNAME}/s/leave/${id}`);
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

  // Updated to use the new data structure
  const getLeaveTypeName = (leaveRequest) => {
    if (!leaveRequest) return "ไม่ระบุประเภท";
    return leaveRequest.leaveRequestType?.leaveTypeName || "ไม่ระบุประเภท";
  };

  // Format class time for display
  const formatClassTime = (timeString) => {
    if (!timeString) return "-";
    // Convert "14:40:00" to "14:40"
    return timeString.substring(0, 5);
  };

  // Map status to Thai and return with proper styling
  const getStatusDisplay = (status) => {
    switch (status) {
      case "WAITING":
        return (
          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            รอการอนุมัติ
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            อนุมัติแล้ว
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            ไม่อนุมัติ
          </span>
        );
      case "CANCELED":
        return (
          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            ยกเลิกแล้ว
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            {status}
          </span>
        );
    }
  };

  // Component for displaying subject information
  const SubjectItem = ({ studyTimeItem }) => {
    const subject = studyTimeItem.studingTime?.timetable?.subject;
    const timeStart = studyTimeItem.studingTime?.timetable?.timeStart;
    const timeEnd = studyTimeItem.studingTime?.timetable?.timeEnd;
    const teacher = subject?.teacher;

    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-line mb-3 hover:shadow-sm transition-shadow ">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">
              {subject?.subCode} - {subject?.subNameThai}
            </h4>
            <p className="text-sm text-text-color-alt mt-1">
              เวลา {formatClassTime(timeStart)} - {formatClassTime(timeEnd)} น.
            </p>
            <p className="text-sm text-text-color-alt">
              อาจารย์ผู้สอน: {teacher?.fName} {teacher?.lName}
            </p>
          </div>
          <div>{getStatusDisplay(studyTimeItem.leaveStatus)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="sm:max-w-md md:max-w-lg  mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/leavereq")}
          className="mr-4 p-2.5 hover:bg-gray-100 rounded-full transition-colors group"
          aria-label="กลับไปหน้ารายการคำร้องขอลา"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-primary group-hover:text-accent transition-colors"
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
        <h1 className="text-2xl font-bold text-primary">
          รายละเอียดคำร้องขอลา
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-line shadow-sm p-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-text-color-alt">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-lg text-red-600 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-500 mx-auto mb-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-lg font-medium">{error}</p>
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
                <div className="bg-gray-50 p-5 rounded-lg border border-line hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h3 className="font-medium text-lg">
                      {getLeaveTypeName(leaveRequest)}
                    </h3>
                    {/* {leaveRequest.studingTime &&
                      leaveRequest.studingTime.length > 0 &&
                      getStatusDisplay(leaveRequest.studingTime[0].leaveStatus)}*/}
                  </div>
                  <p className="text-sm text-text-color-alt mt-2">
                    หมายเลขคำร้อง:{" "}
                    <span className="font-medium">
                      {leaveRequest.leaveId?.substring(0, 8) || "-"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-line">
                <h4 className="font-medium mb-2 text-primary text-sm uppercase">
                  วันที่ลา
                </h4>
                <p className="text-text-color font-medium">
                  {formatThaiDate(leaveRequest.leaveDate)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-line">
                <h4 className="font-medium mb-2 text-primary text-sm uppercase">
                  วันที่ส่งคำร้อง
                </h4>
                <p className="text-text-color font-medium">
                  {formatThaiDateTime(leaveRequest.createdAt)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-primary flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                ข้อมูลนักเรียน
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-line hover:shadow-sm transition-shadow">
                <p className="text-text-color font-medium">
                  {formatTitle(leaveRequest.student?.title)}
                  {leaveRequest.student?.fName} {leaveRequest.student?.lName}
                </p>
                <p className="text-sm text-text-color-alt mt-1">
                  อีเมล: {leaveRequest.student?.email || "-"}
                </p>
                {leaveRequest.student?.tel && (
                  <p className="text-sm text-text-color-alt">
                    เบอร์โทรศัพท์: {leaveRequest.student.tel}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-primary flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                รายวิชาที่ขอลา
              </h4>
              {leaveRequest.studingTime &&
              leaveRequest.studingTime.length > 0 ? (
                leaveRequest.studingTime.map((item) => (
                  <SubjectItem
                    key={item.leaveRequestStudingTimeId}
                    studyTimeItem={item}
                  />
                ))
              ) : (
                <p className="text-text-color-alt bg-gray-50 p-4 rounded-lg border border-line">
                  ไม่พบข้อมูลรายวิชาที่ขอลา
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-3 text-primary flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                เหตุผลในการลา
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-line hover:shadow-sm transition-shadow">
                <p className="text-text-color whitespace-pre-line">
                  {leaveRequest.leaveReason || "ไม่ได้ระบุเหตุผล"}
                </p>
              </div>
            </div>

            {leaveRequest.LeaveFile && (
              <div>
                <h4 className="font-medium mb-3 text-primary flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 102 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  ไฟล์แนบ
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-line hover:shadow-sm transition-shadow flex items-center">
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
                    href={leaveRequest.LeaveFile}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    ดาวน์โหลดไฟล์แนบ
                  </a>
                </div>
              </div>
            )}

            {leaveRequest.studingTime &&
              leaveRequest.studingTime.some(
                (item) =>
                  item.leaveStatus === "APPROVED" ||
                  item.leaveStatus === "REJECTED",
              ) && (
                <div>
                  <h4 className="font-medium mb-3 text-primary flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ข้อมูลการดำเนินการ
                  </h4>
                  {leaveRequest.studingTime
                    .filter(
                      (item) =>
                        item.teacherApprove ||
                        item.leaveStatus === "APPROVED" ||
                        item.leaveStatus === "REJECTED",
                    )
                    .map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg border border-line space-y-2 mb-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-medium">
                            {item.studingTime?.timetable?.subject
                              ?.subNameThai || "รายวิชาไม่ระบุ"}
                            :
                          </p>
                          {getStatusDisplay(item.leaveStatus)}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                          <p>
                            <span className="text-text-color-alt">
                              ผู้ดำเนินการ:{" "}
                            </span>
                            <span className="text-text-color">
                              {item.teacherApprove?.fName}{" "}
                              {item.teacherApprove?.lName || "ไม่ระบุ"}
                            </span>
                          </p>
                          <p>
                            <span className="text-text-color-alt">
                              เวลาดำเนินการ:{" "}
                            </span>
                            <span className="text-text-color">
                              {formatThaiDateTime(item.approverTimestamp)}
                            </span>
                          </p>
                        </div>
                        {item.rejectedNote && (
                          <p>
                            <span className="text-text-color-alt">
                              เหตุผลการปฏิเสธ:{" "}
                            </span>
                            <span className="text-text-color">
                              {item.rejectedNote}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}

            {leaveRequest.studingTime &&
              leaveRequest.studingTime.every(
                (item) => item.leaveStatus === "WAITING",
              ) && (
                <div className="border-t pt-5 mt-2">
                  <button
                    onClick={async () => {
                      if (confirm("คุณต้องการยกเลิกคำร้องขอลานี้ใช่หรือไม่?")) {
                        try {
                          await axios.delete(
                            `${HOSTNAME}/s/leave/${leaveRequest.leaveId}`,
                            {
                              leaveStatus: "CANCELED",
                            },
                          );
                          navigate("/leavereq");
                        } catch (error) {
                          console.error(
                            "Error canceling leave request:",
                            error,
                          );
                        }
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ยกเลิกคำขอ
                  </button>
                </div>
              )}
          </div>
        ) : (
          <div className="bg-yellow-50 p-6 rounded-lg text-yellow-700 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-yellow-500 mx-auto mb-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-lg font-medium">ไม่พบข้อมูลคำร้องขอลา</p>
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
