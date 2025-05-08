import axios from "axios";
import { DateTime } from "luxon";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { useEffect, useState } from "react";

function EnrollmentCard({ enrollmentInfo, index, callEnrollmentApi }) {
    const [status, setStatus] = useState(false);
    const teacher = enrollmentInfo.timetable.subject.teacher;
    const timetable = enrollmentInfo.timetable;
    const subject = enrollmentInfo.timetable.subject;

    const isEnrollmentCheck = async () => {
        try{
            const response = await axios.post(`${HOSTNAME}/s/attendence/isEnrollment`, {enrollmentInfo : enrollmentInfo})
            if(response.status === 200) {
                return response.data.isFound;
            }else{
                throw new Error(response.data.message);
            };
        }catch(error) {
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
        }else {
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
        } else if(dtNow > dtStart) {
            return (
                <p className="flex items-center gap-2 text-xs px-1.5 py-0.5 border border-red-500 bg-red-100 rounded-md text-red-600 ">
                    <span className="block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    เรียนแล้ว
                </p>
            );
        } else if(dtNow < dtEnd) {
            return (
                <p className="flex items-center gap-2 text-xs px-1.5 py-0.5 border border-yellow-500 bg-yellow-100 rounded-md text-yellow-600 ">
                    <span className="block w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                    ยังไม่เรียน
                </p>
            );
        }
    };

    useEffect(() => {
        const fetchEnrollmentStatus = async () => {
            const result = await isEnrollmentCheck();
            if(result === 1) {
                setStatus(true);
            }else if(result === 0){
                setStatus(false);
            };
        };
        fetchEnrollmentStatus();
    }, []);

    return (
        <div className="grid grid-cols-1 border border-gray-200 rounded-lg bg-white shadow">
            <div className="flex items-center p-3 pb-1.5 border-b border-b-gray-200">
                <div className="text-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                    </svg>    
                </div>
                <div>
                    <h4 className="text-base font-bold tracking-wide text-gray-950">{subject.subNameThai} - {subject.subNameEng} ({subject.subCode})</h4>
                    <p className="text-xs font-semibold">{timeFormat(timetable.timeStart)} - {timeFormat(timetable.timeEnd)}</p>
                </div>
            </div>
            <div className="flex justify-between items-center p-5 pt-3">
                <div className="flex gap-4">
                    <div className="grid grid-cols-1 gap-0.5">
                        <p className="text-sm text-gray-600 font-medium tracking-wide">สถานะ</p>
                        {compareTimeStatus()}
                    </div>
                    <div className="grid grid-cols-1 gap-0.5">
                        <p className="text-sm text-gray-600 font-medium tracking-wide">อาจารย์</p>
                        <p className="text-base text-gray-950 font-bold">{teacher.fName} {teacher.lName}</p>
                    </div>
                </div>
                {compareTime() && (
                    <button
                        disabled={status}
                        onClick={() => callEnrollmentApi()}
                        className={`text-sm font-semibold tracking-wide px-4 py-2 rounded-md shadow-sm transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                            status
                            ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                            :  'bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white'
                        }`}
                    >
                        { status ?  'เช็คชื่อแล้ว' : 'เช็คชื่อ'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default EnrollmentCard;