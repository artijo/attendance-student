import { DateTime } from "luxon";
import { useLocation } from "react-router-dom";
import { getThaiMonth } from "../../helper";
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
    const sliceActivityHistoryProcessedList = activityHistoryProcessed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            const response = await axios.get(`${HOSTNAME}/s/activity/hitory/${activity.actId}`);
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
        const dtNow = DateTime.now().setZone('Asia/Bangkok');
        const actStart = DateTime.fromISO(activity.actDate).setZone('Asia/Bangkok').startOf('day');
        const actEnd = DateTime.fromISO(activity.actDateEnd).setZone('Asia/Bangkok').startOf('day');
        let currentDate = actStart;

        while (currentDate.toMillis() <= actEnd.toMillis()) {
            if (currentDate > dtNow) break;
            if (currentDate.weekday !== 6 && currentDate.weekday !== 7) {
                const startDay = currentDate.startOf('day');
                const endDay = currentDate.endOf('day');

                const findHistory = activityPaticipate.find((item) => {
                    const timestamp = DateTime.fromISO(item.joinTimestamp).setZone('Asia/Bangkok').startOf('day');
                    return timestamp >= startDay && timestamp <= endDay;
                });

                if (findHistory) {
                    history.push({
                        ...findHistory,
                        date: `${currentDate.day} ${getThaiMonth(currentDate.month)} ${currentDate.year + 543}`
                    });
                } else {
                    history.push({
                        joinTimestamp: null,
                        leader: null,
                        operateBy: '-',
                        teacher: null,
                        note: '-',
                        date: `${currentDate.day} ${getThaiMonth(currentDate.month)} ${currentDate.year + 543}`,
                    });
                }
            }

            currentDate = currentDate.plus({ days: 1 });
        }
        // console.log(history);
        setActivityHistoryProcessed(history);
    };

    const formatDateRange = (actStartDate, actEndDate) => {
        const sDate = DateTime.fromISO(actStartDate).setZone('Asia/Bangkok');
        const eDate = DateTime.fromISO(actEndDate).setZone('Asia/Bangkok');
        return `${sDate.day} ${getThaiMonth(sDate.month)} ${sDate.year + 543} ถึง ${eDate.day} ${getThaiMonth(eDate.month)} ${eDate.year + 543}`;
    };

    const formatDate = (date) => {
        const dateformat = DateTime.fromISO(date).setZone('Asia/Bangkok');
        return `${dateformat.day} ${getThaiMonth(dateformat.month)} ${dateformat.year}`;
    };

    const activityStatusFormat = (status) => {
        switch (status.toUpperCase()) {
            case 'PROCESSING':
                return 'กำลังดำเนิน'
            case 'FINISHED':
                return 'สิ้นสุดกิจกรรม'
            default:
                return '-';
        };
    }

    if (!activity) {
        return (
            <div className="grid grid-cols-1 gap-2 sm:max-w-md md:max-w-lg mx-auto p-4">
                <div>
                    <h2 className="text-2xl font-semibold text-left text-primary font-heading">รายละเอียดกิจกรรม</h2>
                    <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
                </div>
            </div>
        );
    };

    // if (!activityHistoryProcessed || activityHistoryProcessed.length === 0) {
    //     return (
    //         <div className="grid grid-cols-1 gap-2 sm:max-w-md md:max-w-lg mx-auto p-4">
    //             <div>
    //                 <h2 className="text-2xl font-semibold text-left text-primary font-heading">รายละเอียดกิจกรรม</h2>
    //                 <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
    //             </div>
    //             <p className="text-center text-text-color-alt">ไม่มีประวัติการเข้าร่วมกิจกรรม</p>
    //         </div>
    //     );
    // }

    return (
        <div className="grid grid-cols-1 gap-3 sm:max-w-md md:max-w-lg mx-auto p-4">
            <div>
                <h2 className="text-2xl font-semibold text-left text-primary font-heading">รายละเอียดกิจกรรม</h2>
                <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 gap-1.5 p-3 border border-gray-200 rounded bg-white">
                <div className="flex justify-start items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <div className="flex justify-start items-center gap-1.5">
                        <h5 className="font-bold text-text-color">กิจกรรม {activity.actName}</h5>
                        <p className={
                            activityStatusFormat(activity.actStatus) === 'กำลังดำเนิน' ? 'text-xs bg-green-100 text-green-800 rounded-full px-1.5' : 'text-xs bg-yellow-200 text-yellow-800 rounded-full px-1.5'
                        }>
                            {activityStatusFormat(activity.actStatus)}
                        </p>
                    </div>

                </div>
                <div className="grid grid-cols-1 gap-1.5">
                    <div className="flex justify-between text-xs pb-1 border-b border-gray-200">
                        <p className="font-bold">ระยะเวลากิจกรรม</p>
                        <p className="text-text-color-alt">{formatDateRange(activity.actDate, activity.actDateEnd)}</p>
                    </div>
                    <div className="flex justify-between text-xs pb-1 border-b border-gray-200">
                        <p className="font-bold">เวลาเริ่ม-สิ้นสุด</p>
                        <p className="text-text-color-alt">{activity.actStartTime} น.- {activity.actEndTime} น.</p>
                    </div>
                    <div className="flex justify-between text-xs pb-1 border-b border-gray-200">
                        <p className="font-bold">สถานที่</p>
                        <p className="text-text-color-alt">{activity.actLocation}</p>
                    </div>
                    <div className="flex justify-between text-xs pb-1 border-b border-gray-200">
                        <p className="font-bold">ประเภทกิจกรรม</p>
                        <p className="text-text-color-alt">{activity.activityType.actTypeName}</p>
                    </div>
                    <div className="flex justify-between text-xs pb-1 ">
                        <p className="font-bold w-3/4">รายละเอียดกิจกรรม</p>
                        <p className="text-text-color-alt text-right">{activity.actDesc}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <div>
                    <h2 className="text-2xl font-semibold text-left text-primary font-heading">ประวัติการเข้าร่วมกิจกรรม</h2>
                    <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
                </div>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    วันที่
                                </th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    สถานะการเข้าร่วม
                                </th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    จัดการโดย
                                </th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    จัดการโดยอาจารย์
                                </th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                    จัดการโดยหัวหน้าห้อง
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sliceActivityHistoryProcessedList.length === 0 && (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                    <td colSpan="5" className="px-6 py-4 text-center text-text-color-alt">
                                        ไม่มีประวัติการเข้าร่วมกิจกรรม
                                    </td>
                                </tr>
                            )}
                            {sliceActivityHistoryProcessedList.length > 0 && sliceActivityHistoryProcessedList.map((act) => (
                                <tr key={act.date} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">

                                    <th scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap dark:text-white">
                                        {act.date}
                                    </th>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-row justify-start gap-1.5">
                                            <p
                                                className={act.joinTimestamp != null ? 'text-xs bg-green-100 text-green-800 rounded-full px-1.5' : 'text-xs bg-red-200 text-red-800 rounded-full px-1.5'}
                                            >{act.joinTimestamp != null ? 'เข้าร่วม' : 'ไม่เข้าร่วม'}</p>
                                            <p className="text-xs">{act.joinTimestamp != null ? formatDate(act.joinTimestamp) : ''}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {act.operateBy != '-' ? act.operateBy : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {act.teacher != null ? `${act.teacher.fName} ${act.teacher.lName}` : `-`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {act.leader != null ? `${act.leader.student.fName} ${act.leader.student.lName}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {sliceActivityHistoryProcessedList.length > 0 && (
                    <div className="border-t border-line px-6 py-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-text-color-alt">
                                แสดง <span className="font-medium text-text-color">{sliceActivityHistoryProcessedList.length}</span> จาก <span className="font-medium text-text-color">{activityHistoryProcessed.length}</span> รายการ
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
                )}

            </div>

        </div>
    );
};

export default ActivityInfo;