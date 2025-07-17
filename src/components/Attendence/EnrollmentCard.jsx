import axios from "axios";
import { DateTime } from "luxon";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { useEffect, useState } from "react";

function EnrollmentCard({ enrollmentInfo, index, callEnrollmentApi, isError, isLoading }) {
    const [status, setStatus] = useState(false);
    const teacher = enrollmentInfo.timetable.subject.teacher;
    const timetable = enrollmentInfo.timetable;
    const subject = enrollmentInfo.timetable.subject;
    const isEnrollmentCheck = async () => {
        try {
            const response = await axios.post(`${HOSTNAME}/s/attendence/isEnrollment`, { enrollmentInfo: enrollmentInfo })
            if (response.status === 200) {
                return response.data.isFound;
            } else {
                throw new Error(response.data.message);
            };
        } catch (error) {
            console.error(error);
        };
    };

    const timeFormat = (time) => {
        const spiltTime = time.split(":");
        return `${spiltTime[0]}:${spiltTime[1]}`;
    };

    const compareTime = () => {
        const dtNow = DateTime.now().setZone(TIME_ZONE);
        const dtStart = DateTime.fromISO(timetable.timeStart).setZone(TIME_ZONE);
        const dtEnd = DateTime.fromISO(timetable.timeEnd).setZone(TIME_ZONE);
        if (dtNow >= dtStart && dtNow <= dtEnd) {
            return true;
        } else {
            return false;
        };
    };

    const compareTimeStatus = () => {
        const dtNow = DateTime.now().setZone(TIME_ZONE);
        const dtStart = DateTime.fromISO(timetable.timeStart).setZone(TIME_ZONE);
        const dtEnd = DateTime.fromISO(timetable.timeEnd).setZone(TIME_ZONE);
        // console.log(dtNow >= dtStart);
        // console.log(dtStart);
        if (dtNow >= dtStart && dtNow <= dtEnd) {
            return (
                <p className="flex items-center gap-2 text-xs px-1.5 py-0.5 border border-green-500 bg-green-100 rounded-md text-green-600 ">
                    <span className="block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    กำลังเรียน
                </p>
            );
        } else if (dtNow > dtStart) {
            return (
                <p className="flex items-center gap-2 text-xs px-1.5 py-0.5 border border-red-500 bg-red-100 rounded-md text-red-600 ">
                    <span className="block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    เรียนแล้ว
                </p>
            );
        } else if (dtNow < dtEnd) {
            return (
                <p className="flex items-center gap-2 text-xs px-1.5 py-0.5 border border-yellow-500 bg-yellow-100 rounded-md text-yellow-600 ">
                    <span className="block w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                    ยังไม่เรียน
                </p>
            );
        }
    };

    // const EnrollmentButton = ({ callEnrollmentApi, isError, isLoading, status, compareTime }) => {

    //     const compareTimeStatus = compareTime();
    //     if (compareTimeStatus) {
    //         return (
    //             <button
    //                 disabled={status}
    //                 onClick={() => callEnrollmentApi()}
    //                 className={`text-sm font-semibold tracking-wide mt-4 w-full px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${status
    //                     ? 'bg-gray-400 cursor-not-allowed opacity-50'
    //                     : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white'
    //                     }`}
    //             >
    //                 {status ? 'เช็คชื่อแล้ว' : 'เช็คชื่อ'}
    //             </button>
    //         )
    //     }

    //     if (isLoading && compareTimeStatus) {
    //         return (
    //             <button
    //                 disabled={true}
    //                 className={`text-sm font-semibold tracking-wide mt-4 w-full px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-opacity-50 bg-gray-400 cursor-not-allowed opacity-50 `}
    //             >
    //                 <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
    //                     <svg
    //                         className="text-gray-300 animate-spin"
    //                         viewBox="0 0 64 64"
    //                         fill="none"
    //                         xmlns="http://www.w3.org/2000/svg"
    //                         width="24"
    //                         height="24"
    //                     >
    //                         <path
    //                             d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
    //                             stroke="currentColor"
    //                             strokeWidth="5"
    //                             strokeLinecap="round"
    //                             strokeLinejoin="round"
    //                         />
    //                         <path
    //                             d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
    //                             stroke="currentColor"
    //                             strokeWidth="5"
    //                             strokeLinecap="round"
    //                             strokeLinejoin="round"
    //                             className="text-gray-900"
    //                         />
    //                     </svg>
    //                 </div>

    //                 กำลังลงชื่อ...
    //             </button>
    //         )
    //     }

    //     if (isError && compareTimeStatus) {
    //         return (
    //             <button
    //                 disabled={true}
    //                 className={`text-sm font-semibold tracking-wide mt-4 w-full px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-opacity-50 bg-gray-400 cursor-not-allowed opacity-50 `}
    //             >
    //                 เช็คชื่อ
    //             </button>
    //         )
    //     }


    // }

    useEffect(() => {
        const fetchEnrollmentStatus = async () => {
            const result = await isEnrollmentCheck();
            if (result === 1) {
                setStatus(true);
            } else if (result === 0) {
                setStatus(false);
            };
        };
        fetchEnrollmentStatus();
    }, []);

    return (
        <div className="grid grid-cols-1 border border-gray-200 rounded-xl bg-white shadow">
            <div className="flex items-center p-3 pb-1.5 border-b border-b-gray-200 bg-accent text-white rounded-t-xl">
                <div className="">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                    </svg>
                </div>
                <div className="mt-1">
                    <h4 className="text-base font-bold tracking-wide ">{subject.subNameThai} - {subject.subNameEng} ({subject.subCode})</h4>
                    <p className="text-xs font-semibold">เวลา {timeFormat(timetable.timeStart)} น. - {timeFormat(timetable.timeEnd)} น.</p>
                </div>
            </div>
            <div className="flex flex-col items-start p-5 pt-3">
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-1 gap-0.5">
                        <p className="text-sm text-gray-600 font-medium tracking-wide">สถานะ</p>
                        {compareTimeStatus()}
                    </div>
                    <div className="grid grid-cols-1 gap-0.5">
                        <p className="text-sm text-gray-600 font-medium tracking-wide">ผู้สอน</p>
                        <p className="flex items-center gap-2 text-xs px-1.5 py-0.5 border border-gray-500 bg-gray-100 rounded-md text-gray-600 ">
                            <span className="block w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                            {teacher.fName} {teacher.lName}
                        </p>
                    </div>
                </div>
                {/* <EnrollmentButton
                    callEnrollmentApi={callEnrollmentApi}
                    isError={isError}
                    isLoading={isLoading}
                    status={status}
                    compareTime={compareTime}
                /> */}

                {compareTime() && (
                    isError ? (
                        <button
                            disabled={true}
                            className={`text-sm font-semibold tracking-wide mt-4 w-full px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-opacity-50 bg-gray-400 cursor-not-allowed opacity-50 `}
                        >
                            เช็คชื่อ
                        </button>
                    ) :
                        isLoading ? (
                            <button
                                disabled={true}
                                className={`text-sm font-semibold tracking-wide mt-4 w-full px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-opacity-50 bg-gray-400 cursor-not-allowed opacity-50 `}
                            >
                                กำลังลงชื่อ...
                            </button>
                        )
                            :
                        (
                            <button
                                disabled={status}
                                onClick={() => callEnrollmentApi()}
                                className={`text-sm font-semibold tracking-wide mt-4 w-full px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${status
                                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white'
                                }`}
                            >
                                {status ? 'เช็คชื่อแล้ว' : 'เช็คชื่อ'}
                            </button>
                        )

                )}
            </div>
        </div>
    );
};


export default EnrollmentCard;