import axios from "axios";
import { useEffect, useState } from "react";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { DateTime } from "luxon";
import {
  getThaiMonth,
  weekDayToThaiString,
} from "../../helper";
function ActivityMainPage() {
  const dtNow = DateTime.now().setZone("Asia/Bangkok");
  // const [activityInThisDay, setActivityInThisDay] = useState([]);
  const [currentActivity, setCurrentActivity] = useState([]);
  const [passedActivity, setPassedActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // const [activity, setActivity] = useState([]);

  const isActivityTimeCanEnrollment = (activity) => {
    const now = DateTime.now().setZone("Asia/Bangkok");
    const today = now.toFormat("yyyy-MM-dd");

    // Create DateTime objects for start and end times today
    const startAct = DateTime.fromISO(`${today}T${activity.actStartTime}:00`, {
      zone: "Asia/Bangkok",
    });
    const endAct = DateTime.fromISO(`${today}T${activity.actEndTime}:00`, {
      zone: "Asia/Bangkok",
    });

    // Activity is available for enrollment if current time is within the activity time
    return now >= startAct && now <= endAct;
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
      setIsLoading(true);
      setLoadingMessage("กำลังบันทึกการเข้ากิจกรรม...");
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
      setIsLoading(false);
      setLoadingMessage("");
      alert("เกิดข้อผิดพลาดในการบันทึกการเข้ากิจกรรม");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    };
  };

  const activityStatus = (activity) => {
    const startTime = DateTime.fromISO(`${dtNow.toFormat("yyyy-MM-dd")}T${activity.actStartTime}:00`).setZone(TIME_ZONE);
    const endTime = DateTime.fromISO(`${dtNow.toFormat("yyyy-MM-dd")}T${activity.actEndTime}:00`).setZone(TIME_ZONE);
    if (dtNow < startTime) {
      return "ยังไม่เริ่ม";
    } else if (dtNow > endTime) {
      return "สิ้นสุดแล้ว";
    }
  }

  const isCurrentDateInRange = async (activity) => {
    const now = DateTime.now().setZone("Asia/Bangkok");
    const today = now.startOf("day");

    const activityInDateRange = activity.filter((item) => {
      const activityStartDate = DateTime.fromISO(item.actDate)
        .setZone("Asia/Bangkok")
        .startOf("day");
      const activityEndDate = DateTime.fromISO(item.actDateEnd)
        .setZone("Asia/Bangkok")
        .startOf("day");

      // Check if today falls within the activity date range
      return today >= activityStartDate && today <= activityEndDate;
    });

    const createButtonStatus = await Promise.all(
      activityInDateRange.map(async (act) => {
        const isFound = await isCheckedInActivity(act.actId);
        return isFound;
      })
    );

    const addIsActivityCheckInArr = activityInDateRange.map((act, index) => {
      return {
        ...act,
        isCheckedIn: createButtonStatus[index],
      };
    });

    // Filter activities: current (within time range) vs passed (outside time range)
    const currentActivityFilter = addIsActivityCheckInArr.filter((act) =>
      isActivityTimeCanEnrollment(act)
    );
    const passedActivityFilter = addIsActivityCheckInArr.filter(
      (act) => !isActivityTimeCanEnrollment(act)
    ).sort((a, b) => {
      const endA = DateTime.fromISO(`${a.actDate}T${a.actEndTime}:00`, { zone: "Asia/Bangkok" });
      const endB = DateTime.fromISO(`${b.actDate}T${b.actEndTime}:00`, { zone: "Asia/Bangkok" });
      return endB - endA;
    });

    setCurrentActivity(currentActivityFilter);
    setPassedActivity(passedActivityFilter);
  };

  const callActivity = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("กำลังโหลดข้อมูลกิจกรรม...");
      const respone = await axios.get(`${HOSTNAME}/s/activity`);
      if (respone.status === 200) {
        // setActivity(respone.data);
        isCurrentDateInRange(respone.data);
      } else {
        throw new Error(respone.data.message);

      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setLoadingMessage("");
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    callActivity();
  }, []);

  return (
    <div className="sm:max-w-md md:max-w-lg mx-auto p-2">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
          เช็คชื่อเข้ากิจกรรม
        </h1>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
        <p className="mt-3 text-gray-600">
          {weekDayToThaiString(dtNow.weekday)}, {dtNow.day}{" "}
          {getThaiMonth(dtNow.month)} {dtNow.year + 543}
        </p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 w-full h-full flex flex-col justify-center items-center py-12 gap-5 backdrop-blur-sm bg-white/30">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          <p className="text-primary">{loadingMessage}</p>
        </div>
      )}

      {/* Quick Activity Check-in Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 text-nowrap">
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

        {currentActivity.length > 0 || passedActivity.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {currentActivity.length > 0 ? (
              currentActivity.map((act, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-l-primary border border-gray-200"
                >
                  <div className="p-4 text-white bg-primary">
                    <div className="flex justify-between items-center gap-2">
                      <h2 className="text-lg font-bold">{act.actName}</h2>
                      <span className="text-nowrap px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-white text-primary">
                        กำลังดำเนินการ
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
                        {dtNow.day} {getThaiMonth(dtNow.month)}{" "}
                        {dtNow.year + 543}
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
                      className={`mt-4 w-full py-2 rounded-md font-medium transition-colors flex items-center justify-center shadow-sm ${act.isCheckedIn
                        ? "bg-gray-400 text-white opacity-50 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      onClick={() => checkInActivity(act)}
                      disabled={act.isCheckedIn}
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
                      {act.isCheckedIn
                        ? "เช็คชื่อเข้าร่วมกิจกรรมแล้ว"
                        : "เข้าร่วมกิจกรรม"}
                    </button>
                  </div>
                </div>
              ))
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

            <h2 className="text-xl font-semibold mt-4 mb-4 flex items-center text-gray-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-yellow-400  mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                  clipRule="evenodd"
                />
              </svg>
              กิจกรรมที่สิ้นสุดเวลาแล้วหรือยังไม่เริ่ม
            </h2>

            {passedActivity.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {passedActivity.map((act, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-l-gray-400 border border-gray-200"
                  >
                    <div className="p-4 text-white bg-gray-500">
                      <div className="flex justify-between items-center gap-2">
                        <h2 className="text-lg font-bold">{act.actName}</h2>
                        <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-white text-gray-600 text-nowrap">
                          {activityStatus(act)}
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
                          {dtNow.day} {getThaiMonth(dtNow.month)}{" "}
                          {dtNow.year + 543}
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
                    </div>
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>

                <h3 className="text-lg font-medium text-gray-900">
                  ไม่มีกิจกรรมที่ผ่านไปแล้ว
                </h3>
              </div>
            )}
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
    </div>
  );
}

export default ActivityMainPage;
