import { DateTime } from "luxon";
import { useLocation } from "react-router-dom";
import { formatTitle, getThaiMonth } from "../../helper";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { HOSTNAME } from "../../config";

function ActivityInfo() {
  const location = useLocation();
  const { activity } = location.state;
  const [activityHistory, setActivityHistory] = useState([]);
  const [activityHistoryProcessed, setActivityHistoryProcessed] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(activityHistoryProcessed.length / itemsPerPage);
  const sliceActivityHistoryProcessedList = activityHistoryProcessed.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setUpActivityHistory();
  }, []);

  useEffect(() => {
    if (activityHistory.length > 0) {
      createHistoryAttendence(activityHistory);
    }
  }, [activityHistory]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const setUpActivityHistory = async () => {
    try {
      const response = await axios.get(
        `${HOSTNAME}/s/activity/hitory/${activity.actId}`
      );
      if (response.status === 200) {
        setActivityHistory(response.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createHistoryAttendence = (activityPaticipate) => {
    const history = [];
    const dtNow = DateTime.now().setZone("Asia/Bangkok");
    const actStart = DateTime.fromISO(activity.actDate)
      .setZone("Asia/Bangkok")
      .startOf("day");
    const actEnd = DateTime.fromISO(activity.actDateEnd)
      .setZone("Asia/Bangkok")
      .startOf("day");
    let currentDate = actStart;

    while (currentDate.toMillis() <= actEnd.toMillis()) {
      if (currentDate > dtNow) break;
      if (currentDate.weekday !== 6 && currentDate.weekday !== 7) {
        const startDay = currentDate.startOf("day");
        const endDay = currentDate.endOf("day");

        const findHistory = activityPaticipate.find((item) => {
          const timestamp = DateTime.fromISO(item.joinTimestamp)
            .setZone("Asia/Bangkok")
            .startOf("day");
          return timestamp >= startDay && timestamp <= endDay;
        });

        if (findHistory) {
          history.push({
            ...findHistory,
            date: `${currentDate.day} ${getThaiMonth(currentDate.month)} ${
              currentDate.year + 543
            }`,
          });
        } else {
          history.push({
            joinTimestamp: null,
            leader: null,
            operateBy: "-",
            teacher: null,
            note: "-",
            date: `${currentDate.day} ${getThaiMonth(currentDate.month)} ${
              currentDate.year + 543
            }`,
          });
        }
      }

      currentDate = currentDate.plus({ days: 1 });
    }
    // console.log(history);
    setActivityHistoryProcessed(history);
  };

  const formatDateRange = (actStartDate, actEndDate) => {
    const sDate = DateTime.fromISO(actStartDate).setZone("Asia/Bangkok");
    const eDate = DateTime.fromISO(actEndDate).setZone("Asia/Bangkok");
    return `${sDate.day} ${getThaiMonth(sDate.month)} ${sDate.year + 543} ถึง ${
      eDate.day
    } ${getThaiMonth(eDate.month)} ${eDate.year + 543}`;
  };

  const formatTimeLocalTh = (datetime) => {
    // console.log(datetime);
    const date = DateTime.fromISO(datetime)
      .setLocale("th")
      .toFormat("d LLLL yyyy HH:mm 'น.'");
    return date;
  };

  const formatDate = (date) => {
    const dateformat = DateTime.fromISO(date).setZone("Asia/Bangkok");
    return `${dateformat.day} ${getThaiMonth(dateformat.month)} ${
      dateformat.year
    }`;
  };

  const activityStatusFormat = (status) => {
    switch (status.toUpperCase()) {
      case "PROCESSING":
        return "กำลังดำเนิน";
      case "FINISHED":
        return "สิ้นสุดกิจกรรม";
      default:
        return "-";
    }
  };

  if (!activity) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:max-w-md md:max-w-lg mx-auto p-4">
        <div>
          <h2 className="text-2xl font-semibold text-left text-primary font-heading">
            รายละเอียดกิจกรรม
          </h2>
          <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 gap-1.5 p-3 border border-gray-200 rounded bg-white">
          <div className="flex justify-start items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
            <div className="flex justify-start items-center gap-1.5">
              <h5 className="font-bold text-text-color">{activity.actName}</h5>
              <p
                className={
                  activityStatusFormat(activity.actStatus) === "กำลังดำเนิน"
                    ? "text-xs bg-green-100 text-green-800 rounded-full px-1.5"
                    : "text-xs bg-yellow-200 text-yellow-800 rounded-full px-1.5"
                }
              >
                {activityStatusFormat(activity.actStatus)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <div className="flex justify-between text-xs pb-1 border-b border-gray-200">
              <p className="font-bold">ระยะเวลากิจกรรม</p>
              <p className="text-text-color-alt">
                {formatDateRange(activity.actDate, activity.actDateEnd)}
              </p>
            </div>
            <div className="flex justify-between text-xs pb-1 border-b border-gray-200">
              <p className="font-bold">เวลาเริ่ม-สิ้นสุด</p>
              <p className="text-text-color-alt">
                {activity.actStartTime} น.- {activity.actEndTime} น.
              </p>
            </div>
            <div className="flex justify-between text-xs pb-1 border-b border-gray-200">
              <p className="font-bold">สถานที่</p>
              <p className="text-text-color-alt">{activity.actLocation}</p>
            </div>
            <div className="flex justify-between text-xs pb-1 border-b border-gray-200">
              <p className="font-bold">ประเภทกิจกรรม</p>
              <p className="text-text-color-alt">
                {activity.activityType.actTypeName}
              </p>
            </div>
            <div className="flex justify-between text-xs pb-1 ">
              <p className="font-bold w-3/4">รายละเอียดกิจกรรม</p>
              <p className="text-text-color-alt text-right">
                {activity.actDesc}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <h2 className="text-2xl font-semibold text-left text-primary font-heading">
              ประวัติการเข้าร่วมกิจกรรม
            </h2>
            <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
          </div>
          <div className="overflow-auto h-[400px]">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="bg-gray-50 px-6 py-3 whitespace-nowrap sticky"
                  >
                    วันที่
                  </th>
                  <th
                    scope="col"
                    className="bg-gray-50 px-6 py-3 whitespace-nowrap sticky"
                  >
                    สถานะการเข้าร่วม
                  </th>
                  <th
                    scope="col"
                    className="bg-gray-50 px-6 py-3 whitespace-nowrap sticky"
                  >
                    จัดการโดย
                  </th>
                </tr>
              </thead>
              <tbody>
                {sliceActivityHistoryProcessedList.length === 0 && (
                  <tr className="bg-white border-b  border-gray-200">
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-text-color-alt"
                    >
                      ไม่มีประวัติการเข้าร่วมกิจกรรม
                    </td>
                  </tr>
                )}
                {sliceActivityHistoryProcessedList.length > 0 &&
                  sliceActivityHistoryProcessedList.map((act, index) => {
                    const isTeacherOpereted = act?.teacher;
                    const isLeaderOpereted = act?.leader;
                    return (
                      <tr
                        key={act.date}
                        className="bg-white border-b  border-gray-200"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap "
                        >
                          {act.date}
                        </th>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-row justify-start gap-1.5">
                            <p
                              className={
                                act.joinTimestamp != null
                                  ? "text-xs bg-green-100 text-green-800 rounded-full px-1.5"
                                  : "text-xs bg-red-200 text-red-800 rounded-full px-1.5"
                              }
                            >
                              {act.joinTimestamp != null
                                ? "เข้าร่วม"
                                : "ไม่เข้าร่วม"}
                            </p>
                            <p className="text-xs">
                              {act.joinTimestamp != null
                                ? formatTimeLocalTh(act.joinTimestamp)
                                : ""}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {act.operateBy === "teacher"
                            ? `คุณครู ${isTeacherOpereted.fName} ${isTeacherOpereted.lName}`
                            : act.operateBy === "leader"
                            ? `คุณครู ${isLeaderOpereted.fName} ${isLeaderOpereted.lName}`
                            : act.operateBy === "student" && `ตนเอง`}
                          {/* {(() => {
                                                if (isTeacherOpereted !== null) {
                                                    return `คุณครู ${isTeacherOpereted.fName} ${isTeacherOpereted.lName}`;
                                                }
                                                if (isLeaderOpereted !== null) {
                                                    return `${formatTitle(isLeaderOpereted.student.title)} ${isLeaderOpereted.student.fName} ${isLeaderOpereted.student.lName}`;
                                                }
                                                // return 'ตนเอง';
                                            })()} */}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {sliceActivityHistoryProcessedList.length > 0 && (
            <div className="border-t border-line px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-color-alt">
                  แสดง{" "}
                  <span className="font-medium text-text-color">
                    {sliceActivityHistoryProcessedList.length}
                  </span>{" "}
                  จาก{" "}
                  <span className="font-medium text-text-color">
                    {activityHistoryProcessed.length}
                  </span>{" "}
                  รายการ
                </p>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center px-3 py-1 rounded border ${
                      currentPage === 1
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 bg-white text-text-color hover:bg-gray-50 transition-colors"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show current page, first, last, and pages near current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-text-color-alt">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "bg-white text-text-color hover:bg-gray-50 border border-gray-200 transition-colors"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center px-3 py-1 rounded border ${
                      currentPage === totalPages
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 bg-white text-text-color hover:bg-gray-50 transition-colors"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sm:max-w-md md:max-w-lg mx-auto p-2">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
          รายละเอียดกิจกรรม
        </h1>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
      </div>

      {/* Activity Information Card */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {activity.actName}
              </h2>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  activityStatusFormat(activity.actStatus) === "กำลังดำเนิน"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {activityStatusFormat(activity.actStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-secondary mr-3 flex-shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-600">
                ระยะเวลากิจกรรม
              </p>
              <p className="text-sm text-gray-900 mt-1">
                {formatDateRange(activity.actDate, activity.actDateEnd)}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-secondary mr-3 flex-shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-600">
                เวลาเริ่ม-สิ้นสุด
              </p>
              <p className="text-sm text-gray-900 mt-1">
                {activity.actStartTime} น. - {activity.actEndTime} น.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-secondary mr-3 flex-shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-600">สถานที่</p>
              <p className="text-sm text-gray-900 mt-1">
                {activity.actLocation}
              </p>
            </div>
          </div>

          {activity.activityType && (
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-secondary mr-3 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25Zm4.03 6.28a.75.75 0 0 0-1.06-1.06L4.97 9.47a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 0 0 1.06-1.06L6.56 10l1.72-1.72Zm4.5-1.06a.75.75 0 1 0-1.06 1.06L13.44 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06l2.25-2.25a.75.75 0 0 0 0-1.06l-2.25-2.25Z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  ประเภทกิจกรรม
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {activity.activityType.actTypeName}
                </p>
              </div>
            </div>
          )}

          {activity.actDesc && (
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-secondary mr-3 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  รายละเอียดกิจกรรม
                </p>
                <p className="text-sm text-gray-900 leading-relaxed mt-1">
                  {activity.actDesc}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity History Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          ประวัติการเข้าร่วมกิจกรรม
        </h2>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    วันที่
                  </th>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    สถานะการเข้าร่วม
                  </th>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    จัดการโดย
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sliceActivityHistoryProcessedList.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 md:px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-400 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-gray-500">
                          ไม่มีประวัติการเข้าร่วมกิจกรรม
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {sliceActivityHistoryProcessedList.length > 0 &&
                  sliceActivityHistoryProcessedList.map((act, index) => {
                    const isTeacherOpereted = act?.teacher;
                    const isLeaderOpereted = act?.leader;
                    return (
                      <tr key={act.date} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {act.date}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span
                              className={`inline-flex w-fit px-2 py-1 text-xs font-medium rounded-full ${
                                act.joinTimestamp != null
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {act.joinTimestamp != null
                                ? "เข้าร่วม"
                                : "ไม่เข้าร่วม"}
                            </span>
                            {act.joinTimestamp != null && (
                              <span className="text-xs text-gray-500">
                                {formatTimeLocalTh(act.joinTimestamp)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {act.operateBy === "teacher"
                              ? `คุณครู ${isTeacherOpereted.fName} ${isTeacherOpereted.lName}`
                              : act.operateBy === "leader"
                              ? `คุณครู ${isLeaderOpereted.fName} ${isLeaderOpereted.lName}`
                              : act.operateBy === "student"
                              ? "ตนเอง"
                              : "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sliceActivityHistoryProcessedList.length > 0 && (
            <div className="bg-white px-4 md:px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  แสดง{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  ถึง{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      activityHistoryProcessed.length
                    )}
                  </span>{" "}
                  จาก{" "}
                  <span className="font-medium">
                    {activityHistoryProcessed.length}
                  </span>{" "}
                  รายการ
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? "border-gray-300 text-gray-500 bg-white cursor-not-allowed"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span className="ml-1 hidden sm:inline">ก่อนหน้า</span>
                  </button>

                  <div className="hidden sm:flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                              currentPage === page
                                ? "bg-primary border-primary text-white"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? "border-gray-300 text-gray-500 bg-white cursor-not-allowed"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-1 hidden sm:inline">ถัดไป</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityInfo;
