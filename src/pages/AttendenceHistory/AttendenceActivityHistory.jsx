import axios from "axios";
import React, { useEffect, useState } from "react";
import { HOSTNAME } from "../../config";
import { DateTime } from "luxon";
import { getThaiMonth } from "../../helper";
import { useNavigate } from "react-router-dom";

function AttendenceActivityHistory() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [activity, setActivity] = useState([]);
  const [activityFiltered, setActivityFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(activityFiltered.length / itemsPerPage);
  const sliceActivityList = activityFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const navigateToDetailPage = (activityObject) => {
    navigate("/activity/detail", { state: { activity: activityObject } });
  };

  const formatDate = (date) => {
    const dateformat = DateTime.fromISO(date).setZone("Asia/Bangkok");
    return `${dateformat.day} ${getThaiMonth(dateformat.month)} ${dateformat.year + 543}`;
  };

  const filterActivity = (text) => {
    if (text.trim() === "") {
      setActivityFiltered(activity);
      return;
    }
    const filtered = activity.filter((act) => {
      const actName = act.actName.toLowerCase();
      const location = act.actLocation.toLowerCase();
      const type = act.activityType
        ? act.activityType.actTypeName.toLowerCase()
        : "";
      return (
        actName.includes(text.toLowerCase()) ||
        location.includes(text.toLowerCase()) ||
        type.includes(text.toLowerCase())
      );
    });
    setActivityFiltered(filtered);
  };

  const handleSearchBox = (e) => {
    setSearchText(e.target.value);
    filterActivity(e.target.value);
  };

  const callActivity = async () => {
    try {
      const respone = await axios.get(`${HOSTNAME}/s/activity`);
      if (respone.status === 200) {
        setActivity(respone.data);
        setActivityFiltered(respone.data);
      } else {
        throw new Error(respone.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    callActivity();
  }, []);

  return (
    <div>
      <h2 className="text-base font-medium mb-4 flex items-center text-gray-900">
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
        รายการกิจกรรมที่เคยเข้าร่วมทั้งหมด
      </h2>
      <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 mb-4 w-full max-w-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-gray-500 mr-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>

        <input
          type="text"
          value={searchText}
          onChange={(e) => handleSearchBox(e)}
          className="flex-1 outline-none bg-transparent text-gray-800 placeholder:text-gray-400 placeholder:text-xs"
          placeholder="ชื่อกิจกรรม, สถานที่, ประเภทกิจกรรม"
        />
      </div>

      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="rel text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="bg-gray-50 px-6 py-3 whitespace-nowrap"
              >
                กิจกรรม
              </th>
              <th
                scope="col"
                className="bg-gray-50 px-6 py-3 whitespace-nowrap"
              >
                ระยะเวลากิจกรรม
              </th>
              <th
                scope="col"
                className="bg-gray-50 px-6 py-3 whitespace-nowrap"
              >
                ประเภทกิจกรรม
              </th>
              <th
                scope="col"
                className="bg-gray-50 px-6 py-3 whitespace-nowrap"
              >
                สถานที่
              </th>
            </tr>
          </thead>
          <tbody>
            {sliceActivityList.length > 0 ? (
              sliceActivityList.map((act, index) => (
                <tr
                  key={index}
                  className=" bg-white border-b border-gray-200 text-xs"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => navigateToDetailPage(act)}
                  >
                    <span className="text-blue-500">{act.actName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(act.actDate)} - {formatDate(act.actDateEnd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {act.activityType ? act.activityType.actTypeName : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {act.actLocation}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  ไม่พบข้อมูลกิจกรรม
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sliceActivityList.length > 0 && (
        <div className="border-t border-line py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-color-alt">
              แสดง{" "}
              <span className="font-medium text-text-color">
                {sliceActivityList.length}
              </span>{" "}
              จาก{" "}
              <span className="font-medium text-text-color">
                {activityFiltered.length}
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
  );
}

export default AttendenceActivityHistory;
