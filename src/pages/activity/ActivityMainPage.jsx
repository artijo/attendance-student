import axios from "axios";
import React, { useEffect, useState } from "react";
import { HOSTNAME } from "../../config";
import { DateTime } from "luxon";
import {
  getThaiMonth,
  getThaiMonthAbbreviation,
  weekDayToThaiString,
} from "../../helper";
import { useNavigate } from "react-router-dom";

function ActivityMainPage() {
  const navigate = useNavigate();
  const dtNow = DateTime.now().setZone("Asia/Bangkok");
  const [activityInThisDay, setActivityInThisDay] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState([]);
  const [activity, setActivity] = useState([]);

  const navigateToDetailPage = (activityObject) => {
    navigate("/activity/detail", { state: { activity: activityObject } });
  };

  const isCheckedInActivity = async (activityId) => {
    try {
      const respone = await axios.get(
        `${HOSTNAME}/s/activity/isCheckin/${activityId}`
      );
      if (respone.status === 200) {
        return respone.data.isFound;
      } else {
        throw new Error(respone.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkInActivity = async (activity) => {
    try {
      const respone = await axios.post(`${HOSTNAME}/s/activity`, {
        activity: activity,
      });
      if (respone.status === 200) {
        if (parseInt(respone.data.status) === 1) {
          alert("บันทึกการเข้าเรียนสำเร็จ");
          window.location.reload();
        }
      } else {
        throw new Error(respone.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (date) => {
    const dateformat = DateTime.fromISO(date).setZone("Asia/Bangkok");
    // getThaiMonthAbbreviation
    const thMonth = getThaiMonthAbbreviation(dateformat.month);
    return `${dateformat.day} ${thMonth} ${dateformat.year + 543}`;
  };

  const isCurrentDateInRange = async (activity) => {
    const activityAttendanceStatus = activity.reduce((accumulator, item) => {
      const activityStartDate = DateTime.fromISO(item.actDate).setZone(
        "Asia/Bangkok"
      );
      const activityEndDate = DateTime.fromISO(item.actDateEnd).setZone(
        "Asia/Bangkok"
      );
      if (dtNow >= activityStartDate && dtNow <= activityEndDate) {
        accumulator.push(item);
      }
      return accumulator;
    }, []);

    const createButtonStatus = Promise.all(
      activityAttendanceStatus.map(async (act) => {
        const isFound = await isCheckedInActivity(act.actId);
        return isFound;
      })
    );
    setActivityInThisDay(activityAttendanceStatus);
    setIsCheckedIn(await createButtonStatus);
  };

  const callActivity = async () => {
    try {
      const respone = await axios.get(`${HOSTNAME}/s/activity`);
      if (respone.status === 200) {
        setActivity(respone.data);
        isCurrentDateInRange(respone.data);
      } else {
        throw new Error(respone.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isActivityTimeCanEnrollment = (activity) => {
    const startTime = activity.actStartTime.split(":");
    const endTime = activity.actEndTime.split(":");
    const now = DateTime.now();
    const startAct = DateTime.fromISO(
      `${now.toFormat("yyyy-MM-dd")}T${startTime[0]}:${startTime[1]}:00`
    );
    const endAct = DateTime.fromISO(
      `${now.toFormat("yyyy-MM-dd")}T${endTime[0]}:${endTime[1]}:00`
    );
    if (now >= startAct && now <= endAct) {
      return false;
    } else if (now < startAct && now < endAct) {
      return true;
    } else if (now > startAct && now > endAct) {
      return true;
    }
    // return false;
  };

  useEffect(() => {
    callActivity();
  }, []);

  return (
    <div className="sm:max-w-md md:max-w-lg mx-auto p-2">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
          กิจกรรม
        </h1>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
        <p className="mt-3 text-gray-600">
          {weekDayToThaiString(dtNow.weekday)}, {dtNow.day}{" "}
          {getThaiMonth(dtNow.month)} {dtNow.year + 543}
        </p>
      </div>

      {/* Quick Activity Check-in Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-primary"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          เช็คชื่อกิจกรรม (กำลังดำเนินการ)
        </h2>

        {activityInThisDay.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {activityInThisDay.map((act, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-l-primary border border-gray-200"
              >
                <div
                  className={`p-4 text-white ${
                    isActivityTimeCanEnrollment(act)
                      ? "bg-gray-500"
                      : "bg-primary"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">{act.actName}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        isActivityTimeCanEnrollment(act)
                          ? "bg-white text-gray-600"
                          : "bg-white text-primary"
                      }`}
                    >
                      {isActivityTimeCanEnrollment(act)
                        ? "ผ่านไปแล้ว"
                        : "กำลังดำเนินการ"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {dtNow.day} {getThaiMonth(dtNow.month)} {dtNow.year + 543}
                    </span>
                  </div>

                  <div className="flex items-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{act.actLocation}</span>
                  </div>

                  <div className="flex items-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {act.actStartTime}น. - {act.actEndTime}น.
                    </span>
                  </div>

                  <button
                    className={`mt-4 w-full py-2 rounded-md font-medium transition-colors flex items-center justify-center shadow-sm ${
                      isActivityTimeCanEnrollment(act)
                        ? "bg-gray-400 text-white opacity-50 cursor-not-allowed"
                        : isCheckedIn[index]
                        ? "bg-gray-400 text-white opacity-50 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                    onClick={() => checkInActivity(act)}
                    disabled={
                      isActivityTimeCanEnrollment(act) || isCheckedIn[index]
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {isActivityTimeCanEnrollment(act)
                      ? "กิจกรรมสิ้นสุดแล้ว"
                      : isCheckedIn[index]
                      ? "เช็คชื่อเข้าร่วมกิจกรรมแล้ว"
                      : "เข้าร่วมกิจกรรม"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              ไม่มีกิจกรรมที่กำลังดำเนินการในขณะนี้
            </h3>
            <p className="mt-2 text-gray-500">
              ไม่มีกิจกรรมอยู่ในช่วงเวลาปัจจุบัน
            </p>
          </div>
        )}
      </div>

      {/* All Activities Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-secondary"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>
          รายการกิจกรรมทั้งหมด
        </h2>

        {activity.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activity.map((act, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-base font-semibold text-primary mb-4">
                  {act.actName}
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-secondary mr-2 flex-shrink-0 mt-0.5"
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
                      <p className="text-xs font-medium text-gray-600">
                        ระยะเวลากิจกรรม
                      </p>
                      <p className="text-sm text-gray-900">
                        {formatDate(act.actDate)} - {formatDate(act.actDateEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-secondary mr-2 flex-shrink-0 mt-0.5"
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
                      <p className="text-xs font-medium text-gray-600">เวลา</p>
                      <p className="text-sm text-gray-900">
                        {act.actStartTime}น. - {act.actEndTime}น.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-secondary mr-2 flex-shrink-0 mt-0.5"
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
                      <p className="text-xs font-medium text-gray-600">
                        สถานที่
                      </p>
                      <p className="text-sm text-gray-900">{act.actLocation}</p>
                    </div>
                  </div>

                  {act.activityType && (
                    <div className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-secondary mr-2 flex-shrink-0 mt-0.5"
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
                        <p className="text-xs font-medium text-gray-600">
                          ประเภทกิจกรรม
                        </p>
                        <p className="text-sm text-gray-900">
                          {act.activityType.actTypeName}
                        </p>
                      </div>
                    </div>
                  )}

                  {act.actDesc && (
                    <div className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-secondary mr-2 flex-shrink-0 mt-0.5"
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
                        <p className="text-xs font-medium text-gray-600">
                          รายละเอียด
                        </p>
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {act.actDesc}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="w-full bg-primary text-white font-medium text-sm py-2 px-4 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
                  onClick={() => navigateToDetailPage(act)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
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
                  ประวัติการเข้าร่วม
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-12 w-12 mx-auto text-gray-400 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              ไม่มีรายการกิจกรรม
            </h3>
            <p className="mt-2 text-gray-500">
              ไม่มีรายการกิจกรรมหรือคุณอาจไม่มีกิจกรรมที่สามารถเข้าร่วมได้
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityMainPage;
