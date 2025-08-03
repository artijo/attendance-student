import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import axios from "axios";
import { HOSTNAME, TIME_ZONE } from "../config";
import { getThaiMonth, weekDayToThaiString, formatTitle } from "../helper";

function Dashboard() {
  const [currentDateTime, setCurrentDateTime] = useState(
    DateTime.now().setZone(TIME_ZONE)
  );
  const [currentClasses, setCurrentClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState({
    permission: null,
    location: null,
  });
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [dashboardData, setDashboardData] = useState({});

  // Format time for display (HH:MM)
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  // Check if a class is currently in progress
  const isCurrentlyInClass = (timeStart, timeEnd) => {
    const now = currentDateTime;
    const currentTime = now.toFormat("HH:mm");
    return (
      currentTime >= timeStart.substring(0, 5) &&
      currentTime <= timeEnd.substring(0, 5)
    );
  };

  // Request and check for geolocation permission
  const checkLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permission.state === "granted" || permission.state === "prompt") {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationStatus({
              permission: "granted",
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationStatus({
              permission: "error",
              location: null,
              error: error.message,
            });
          }
        );
      } else {
        setLocationStatus({
          permission: "denied",
          location: null,
        });
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      setLocationStatus({
        permission: "error",
        location: null,
        error: error.message,
      });
    }
  };

  // Request location permission
  const requestLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus({
          permission: "granted",
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationStatus({
          permission: "error",
          location: null,
          error: error.message,
        });
      }
    );
  };

  // Fetch timetable data
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${HOSTNAME}/s/timetable`);

      if (response.status === 200 && response.data) {
        // Filter current and upcoming classes
        const allClasses = response.data;
        const current = [];
        const upcoming = [];
        const todayClasses = [];

        // Get today's day of week (1-7, where 1 is Monday)
        const todayDayOfWeek = DateTime.now().setZone(TIME_ZONE).weekday;

        allClasses.forEach((classItem) => {
          const timeStart = classItem.timetable.timeStart;
          const timeEnd = classItem.timetable.timeEnd;
          const classDayOfWeek = classItem.timetable.dayOfWeek;

          // Check if the class is scheduled for today
          if (parseInt(classDayOfWeek) === todayDayOfWeek) {
            todayClasses.push(classItem);
          }

          if (isCurrentlyInClass(timeStart, timeEnd)) {
            current.push(classItem);
          } else {
            // Check if class is upcoming (not past)
            const dtNow = DateTime.now().setZone(TIME_ZONE);
            const dtEnd = DateTime.fromISO(timeEnd).setZone(TIME_ZONE);

            if (dtNow < dtEnd) {
              upcoming.push(classItem);
            }
          }
        });

        // Sort today's classes by start time
        todayClasses.sort((a, b) => {
          return a.timetable.timeStart.localeCompare(b.timetable.timeStart);
        });

        setCurrentClasses(current);
        setUpcomingClasses(todayClasses); // Show all of today's classes instead of just upcoming ones
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
      setError("ไม่สามารถโหลดข้อมูลตารางเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine if a class has already passed
  const isClassPassed = (timeEnd) => {
    const now = currentDateTime;
    const currentTime = now.toFormat("HH:mm");
    return currentTime > timeEnd.substring(0, 5);
  };

  // Helper function to determine if a class is upcoming (not started yet)
  const isClassUpcoming = (timeStart) => {
    const now = currentDateTime;
    const currentTime = now.toFormat("HH:mm");
    return currentTime < timeStart.substring(0, 5);
  };

  // Call enrollment API for attendance
  const handleAttendance = async (enrollmentInfo) => {
    if (!locationStatus.location) {
      alert("กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้งก่อนเช็คชื่อ");
      requestLocationPermission();
      return;
    }

    try {
      const response = await axios.post(`${HOSTNAME}/s/attendence/enrollment`, {
        enrollmentInfo: enrollmentInfo,
        location: locationStatus.location,
      });

      if (response.status === 200) {
        alert("บันทึกการเข้าเรียนเรียบร้อยแล้ว");
        // Refresh data
        fetchTimetable();
      }
    } catch (error) {
      console.error("Error recording attendance:", error);
      if (error.response?.data?.message) {
        alert(`เกิดข้อผิดพลาด: ${error.response.data.message}`);
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกการเข้าเรียน");
      }
    }
  };

  // Check if a student has already checked in
  const isAlreadyCheckedIn = async (enrollmentInfo) => {
    try {
      const response = await axios.post(
        `${HOSTNAME}/s/attendence/isEnrollment`,
        { enrollmentInfo: enrollmentInfo }
      );
      if (response.status === 200) {
        setIsCheckedIn(response.data.isFound === 1);
      } else {
        setIsCheckedIn(false);
      }
    } catch (error) {
      console.error("Error checking attendance status:", error);
      setIsCheckedIn(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${HOSTNAME}/s/dashboard`);
      if (response.status === 200) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData({});
    }
  };

  // Initialize and update the timer
  useEffect(() => {
    fetchTimetable();
    checkLocationPermission();

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentDateTime(DateTime.now().setZone(TIME_ZONE));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Refresh data when location is updated
  useEffect(() => {
    if (locationStatus.permission === "granted" && locationStatus.location) {
      fetchTimetable();
    }
  }, [locationStatus.location]);

  // Check if the user has already checked in for the current class
  useEffect(() => {
    if (currentClasses.length > 0) {
      const currentClass = currentClasses[0]; // Assuming the first class is the current one
      isAlreadyCheckedIn(currentClass);
    }
  }, [currentClasses]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Date and time header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
          Dashboard
        </h1>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
        <p className="mt-3 text-gray-600">
          {weekDayToThaiString(currentDateTime.weekday)}, {currentDateTime.day}{" "}
          {getThaiMonth(currentDateTime.month)} {currentDateTime.year + 543}
        </p>
      </div>

      {/* Student Information Card */}
      {dashboardData && dashboardData.fName && (
        <div className="mb-6 bg-gradient-to-r from-primary to-primary/80 rounded-lg p-4 md:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="bg-white/20 rounded-full p-2 md:p-3 flex-shrink-0">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg md:text-xl font-bold break-words">
                  {formatTitle(dashboardData.title)}
                  {dashboardData.fName} {dashboardData.lName}
                </h2>
                <p className="text-white/80 text-xs md:text-sm">
                  รหัสนักเรียน: {dashboardData.stdId}
                </p>
                {dashboardData.classroomMembers &&
                  dashboardData.classroomMembers.length > 0 && (
                    <>
                      <p className="text-white/80 text-xs md:text-sm">
                        ชั้น ม.{dashboardData.classroomMembers[0].classLevel}/
                        {dashboardData.classroomMembers[0].classRoom}
                        {dashboardData.classroomMembers[0].stdNo &&
                          ` เลขที่ ${dashboardData.classroomMembers[0].stdNo}`}
                      </p>
                      {dashboardData.classroomMembers[0].classroomType && (
                        <p className="text-white/80 text-xs md:text-sm">
                          ประเภทห้องเรียน:{" "}
                          {
                            dashboardData.classroomMembers[0].classroomType
                              .classTypeNameThai
                          }
                        </p>
                      )}
                    </>
                  )}
              </div>
            </div>
            <div className="flex justify-center sm:justify-end">
              {dashboardData.classroomMembers &&
                dashboardData.classroomMembers.length > 0 && (
                  <div className="bg-white/20 rounded-lg p-2 md:p-3 text-center">
                    <p className="text-xs text-white/80">ปีการศึกษา</p>
                    <p className="font-bold text-sm md:text-base">
                      {dashboardData.classroomMembers[0].term.academicYear +
                        543}
                      /{dashboardData.classroomMembers[0].term.semester}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center space-x-2 min-w-0">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="truncate">{dashboardData.email}</span>
              </div>
              <div className="flex items-center space-x-2 min-w-0">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="truncate">{dashboardData.tel}</span>
              </div>
            </div>

            {/* Class Teacher */}
            {dashboardData.classroomMembers &&
              dashboardData.classroomMembers[0]?.classTeacher &&
              dashboardData.classroomMembers[0].classTeacher.length > 0 && (
                <div className="mt-3 flex items-center space-x-2 min-w-0">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="text-xs md:text-sm truncate">
                    ครูประจำชั้น:{" "}
                    {
                      dashboardData.classroomMembers[0].classTeacher[0]
                        .teacherName
                    }
                  </span>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {dashboardData && Object.keys(dashboardData).length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.behaviorScore || "95"}
                </p>
                <p className="text-sm text-gray-600">คะแนนความประพฤติ</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData.classroomMembers &&
                  dashboardData.classroomMembers.length > 0
                    ? dashboardData.classroomMembers[0].pendingLeaves || "0"
                    : "0"}
                </p>
                <p className="text-sm text-gray-600">ใบลาค้างอนุมัติ</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location permission status */}
      {locationStatus.permission !== "granted" && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                การเข้าถึงตำแหน่งที่ตั้งถูกปิดอยู่
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้งเพื่อใช้งานระบบเช็คชื่อ
              </p>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={requestLocationPermission}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md bg-primary hover:bg-primary/90 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  อนุญาตการเข้าถึงตำแหน่งที่ตั้ง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current class section */}
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
          เช็คชื่อด่วน (กำลังเรียนขณะนี้)
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <p className="text-red-700">{error}</p>
          </div>
        ) : currentClasses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {currentClasses.map((classItem) => (
              <div
                key={classItem.timetable.timetableId}
                className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-primary border"
              >
                <div className="bg-primary p-4 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">
                      {classItem.timetable.subject.subCode} -{" "}
                      {classItem.timetable.subject.subNameThai}
                    </h2>
                    <span className="bg-white text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      เรียนอยู่ขณะนี้
                    </span>
                  </div>
                  <p className="text-sm text-white/80 mt-1">
                    {classItem.timetable.subject.subNameEng || "-"}
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
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {formatTime(classItem.timetable.timeStart)} -{" "}
                      {formatTime(classItem.timetable.timeEnd)} น.
                      <span className="text-gray-500 text-xs ml-2">
                        (สาย {formatTime(classItem.timetable.timeLate)} น.)
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                      <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm9.3 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    <span className="text-gray-700">
                      ม.{classItem.timetable.classroom.classLevel}/
                      {classItem.timetable.classroom.classRoom}
                    </span>
                  </div>

                  <div className="flex items-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="text-gray-700">
                      คุณครู {classItem.timetable.subject.teacher.fName}{" "}
                      {classItem.timetable.subject.teacher.lName}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAttendance(classItem)}
                    disabled={isCheckedIn}
                    className={`mt-4 w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm ${
                      isCheckedIn
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
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
                    {isCheckedIn ? "เช็คชื่อเรียบร้อยแล้ว" : "เช็คชื่อ"}
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
              ไม่มีรายวิชาที่กำลังเรียนในขณะนี้
            </h3>
            <p className="mt-2 text-gray-500">
              ไม่มีรายวิชาที่กำลังเรียนอยู่ในขณะนี้
              หรือคุณอาจจะต้องเปิดการเข้าถึงตำแหน่งที่ตั้ง
            </p>
          </div>
        )}
      </div>

      {/* Upcoming classes section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-secondary"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          ตารางเรียนวันนี้
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        ) : upcomingClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingClasses.map((classItem) => {
              const isPast = isClassPassed(classItem.timetable.timeEnd);
              const isCurrent = isCurrentlyInClass(
                classItem.timetable.timeStart,
                classItem.timetable.timeEnd
              );
              const isUpcoming = isClassUpcoming(classItem.timetable.timeStart);

              // Determine colors based on class status
              let statusColor, bgColor, borderColor, statusBgColor, textStatus;

              if (isPast) {
                statusColor = "text-gray-600";
                bgColor = "bg-accent";
                borderColor = "border-gray-300";
                statusBgColor = "bg-gray-100";
                textStatus = "เรียนผ่านไปแล้ว";
              } else if (isCurrent) {
                statusColor = "text-primary";
                bgColor = "bg-primary bg-opacity-90";
                borderColor = "border-primary";
                statusBgColor = "bg-white";
                textStatus = "กำลังเรียน";
              } else {
                statusColor = "text-secondary";
                bgColor = "bg-secondary bg-opacity-90";
                borderColor = "border-secondary";
                statusBgColor = "bg-white";
                textStatus = "กำลังจะเริ่ม";
              }

              return (
                <div
                  key={classItem.timetable.timetableId}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${borderColor} hover:shadow-lg transition-shadow`}
                >
                  <div className={`${bgColor} p-3 text-white`}>
                    <div className="flex justify-between items-center">
                      <h2 className="text-base font-bold truncate mr-2">
                        {classItem.timetable.subject.subCode} -{" "}
                        {classItem.timetable.subject.subNameThai}
                      </h2>
                      <span
                        className={`${statusBgColor} px-2 py-0.5 rounded-full text-xs font-bold ${statusColor} whitespace-nowrap shadow-sm`}
                      >
                        {textStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-center text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          isPast
                            ? "text-gray-400"
                            : isCurrent
                            ? "text-primary"
                            : "text-secondary"
                        } mr-1 flex-shrink-0`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span
                        className={`${
                          isPast ? "text-gray-500" : "text-gray-700"
                        }`}
                      >
                        {formatTime(classItem.timetable.timeStart)} -{" "}
                        {formatTime(classItem.timetable.timeEnd)} น.
                      </span>
                    </div>

                    <div className="flex items-center text-sm mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          isPast
                            ? "text-gray-400"
                            : isCurrent
                            ? "text-primary"
                            : "text-secondary"
                        } mr-1 flex-shrink-0`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                      </svg>
                      <span
                        className={`${
                          isPast ? "text-gray-500" : "text-gray-700"
                        }`}
                      >
                        ม.{classItem.timetable.classroom.classLevel}/
                        {classItem.timetable.classroom.classRoom}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          isPast
                            ? "text-gray-400"
                            : isCurrent
                            ? "text-primary"
                            : "text-secondary"
                        } mr-1 flex-shrink-0`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span
                        className={`${
                          isPast ? "text-gray-500" : "text-gray-700"
                        } truncate`}
                      >
                        คุณครู {classItem.timetable.subject.teacher.fName}{" "}
                        {classItem.timetable.subject.teacher.lName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200 shadow-sm">
            <p className="text-gray-500">ไม่มีรายวิชาที่ต้องเรียนในวันนี้</p>
          </div>
        )}
      </div>

      {/* Quick access section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-primary"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          เมนูลัด
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/attendance"
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:bg-gray-50 transition-all hover:shadow-lg border border-gray-200"
          >
            <div className="bg-primary bg-opacity-10 p-3 rounded-full mb-3">
              <img
                src="/ico/attendance.svg"
                alt="Attendance"
                className="w-6 h-6"
              />
            </div>
            <span className="text-center font-medium text-gray-800">
              เช็คชื่อ
            </span>
          </Link>

          <Link
            to="/leavereq"
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:bg-gray-50 transition-all hover:shadow-lg border border-gray-200"
          >
            <div className="bg-secondary bg-opacity-10 p-3 rounded-full mb-3">
              <img
                src="/ico/leave.svg"
                alt="Leave Request"
                className="w-6 h-6"
              />
            </div>
            <span className="text-center font-medium text-gray-800">
              ลาเรียน
            </span>
          </Link>

          <Link
            to="/history"
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:bg-gray-50 transition-all hover:shadow-lg border border-gray-200"
          >
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <img src="/ico/history.svg" alt="History" className="w-6 h-6" />
            </div>
            <span className="text-center font-medium text-gray-800">
              ประวัติการเข้าเรียน
            </span>
          </Link>

          <Link
            to="/activity"
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:bg-gray-50 transition-all hover:shadow-lg border border-gray-200"
          >
            <div className="bg-purple-100 p-3 rounded-full mb-3">
              <img src="/ico/activity.svg" alt="Activity" className="w-6 h-6" />
            </div>
            <span className="text-center font-medium text-gray-800">
              กิจกรรม
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
