import { DateTime } from "luxon";
import React, { useState } from "react";
import { formatDateToThai, formatDayOfWeeks } from "../../helper";
import { useNavigate } from "react-router-dom";
import Calendar from "../../components/AttendenceHistory/Calendar";

function daybetween(Start, End) {
    const dates = [];
    if (Start !== "" && End !== "") {
        const startDate = DateTime.fromISO(Start).setZone('Asia/Bangkok');
        const endDate = DateTime.fromISO(End).setZone('Asia/Bangkok');
        const dtNow = DateTime.now();
        let currentDate = startDate;
        while (currentDate <= endDate) {
            if (
                currentDate > dtNow
            ) {
                break;
            }
            if (currentDate.weekday !== 6 && currentDate.weekday !== 7) {

                dates.push(currentDate.toISODate().split("-").join("-"));
            };
            currentDate = currentDate.plus({ days: 1 });
        }
    } else {
        console.error("termStart or termEnd is not set!");
    }
    return dates;
}

function AttedenceByDaySummarize({ term }) {
    // console.log(term);
    const navigate = useNavigate();
    const termStart = DateTime.fromISO(term.termStart).setZone('Asia/Bangkok').toString().split("T")[0];
    const termEnd = DateTime.fromISO(term.termEnd).setZone('Asia/Bangkok').toString().split("T")[0];
    const termDaybetween = daybetween(termStart, termEnd);
    const holidaybetween = term.holiday.map((holiday) => {
        const formatDate = DateTime.fromISO(holiday.startHolidayDate).setZone('Asia/Bangkok').toString().split("T")[0];
        return formatDate;
    });
    const termday = termDaybetween.filter((term) => !holidaybetween.includes(term));
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(termday.length / itemsPerPage);
    const sliceDayList = termday.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const navigateDetailPage = (date) => {
        navigate('/history/datedetail', { state: { date: date, termId: term.termId } })
    }

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (!termday.length > 0) {
        return (
            <div className="p-2 border border-gray-200 rounded-md shadow">
                <div className="flex flex-row items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-9 text-[#007BFF]   ">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <h3 className="font-heading text-base text-[#007BFF]">ยังไม่มีรายการแสดงการเข้าเรียน</h3>
                </div>
                <p className="text-sm text-[#4F4F4F] indent-10 font-body">เนื่องจากยังไม่มีข้อมูลการเข้าเรียนตามคาบเรียนในขณะนี้ อาจเป็นเพราะยังไม่ถึงวันที่มีการเรียนการสอนในระบบ กรุณาตรวจสอบอีกครั้งเมื่อถึงวันที่มีคาบเรียน</p>
            </div>
        );
    };


    return (
        <div>
            <Calendar
                term={term}
            />
            {/* {termday.length > 0 && (
                <div className="grid grid-cols-1 gap-5 py-4">
                    {sliceDayList.map((day, index) => (
                        <div
                            key={index}
                            className="w-full flex flex-row justify-between items-center border border-gray-200 bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
                            onClick={() => navigateDetailPage(day)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                        />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl w-fit">
                                        {formatDateToThai(day)}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1 px-3 py-1">
                                        {formatDayOfWeeks(DateTime.fromISO(`${day}T17:00:00`).setZone('Asia/Bangkok').weekday)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            )} */}


            {/* {termday.length > 0 && (
                <div className="border-t border-line px-6 py-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-text-color-alt">
                            แสดง <span className="font-medium text-text-color">{sliceDayList.length}</span> จาก <span className="font-medium text-text-color">{termday.length}</span> รายการ
                        </p>

                        <div className="flex items-center justify-end gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center justify-center px-3 py-1 rounded border ${currentPage === 1
                                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-200 bg-white text-text-color hover:bg-gray-50 transition-colors'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Show current page, first, last, and pages near current
                                    return page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);
                                })
                                .map((page, index, array) => (
                                    <React.Fragment key={page}>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="px-2 text-text-color-alt">...</span>
                                        )}
                                        <button
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1 rounded ${currentPage === page
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-text-color hover:bg-gray-50 border border-gray-200 transition-colors'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                ))
                            }

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`flex items-center justify-center px-3 py-1 rounded border ${currentPage === totalPages
                                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-200 bg-white text-text-color hover:bg-gray-50 transition-colors'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default AttedenceByDaySummarize;