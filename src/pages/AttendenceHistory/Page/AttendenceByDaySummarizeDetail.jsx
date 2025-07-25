import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../../config";
import { formatDateToThai, formatTimeThai, formatTitle } from "../../../helper";
import { DateTime } from "luxon";

function AttendenceByDaySummarizeDetail() {
    const [studingTime, setStudingTime] = useState([]);
    const location = useLocation();
    const { date, termId } = location.state;
    const formatAttStatus = (status) => {
        switch (status.toLowerCase()) {
            case 'present': {
                return 'เข้าเรียน';
            }
            case 'absent': {
                return 'ไม่เข้าเรียน';
            }
            case 'late': {
                return 'มาสาย';
            }
            case 'activity': {

                return 'เข้าเรียนกิจกรรม';
            }
            case 'leave': {

                return 'ลา';
            }
            default:
                return status;
        }
    };

    const getAttStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'present':
                return 'text-green-600 bg-green-100 border border-green-200';
            case 'absent':
                return 'text-red-600 bg-red-100 border border-red-200';
            case 'late':
                return 'text-yellow-700 bg-yellow-100 border border-yellow-200';
            case 'activity':
                return 'text-blue-600 bg-blue-100 border border-blue-200';
            case 'leave':
                return 'text-purple-600 bg-purple-100 border border-purple-200';
            default:
                return 'text-gray-600 bg-gray-100 border border-gray-200';
        }
    };


    const callApiSummarizeDetail = async () => {
        try {
            const response = await axios.get(`${HOSTNAME}/s/attendence/history/${termId}/${date}`);
            if (response.status === 200) {
                setStudingTime(response.data);
                // console.log(response.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error(error);
        };
    };

    const formatTimeLocalTh = (datetime) => {
        // console.log(datetime);
        const date = DateTime.fromISO(datetime).setLocale('th').toFormat("d LLLL yyyy HH:mm 'น.'")
        return date;
    };

    useEffect(() => {
        callApiSummarizeDetail();
    }, []);

    return (
        <div className="sm:max-w-md md:max-w-lg mx-auto p-2">
            <h1 className="text-2xl font-bold text-accent">การเข้าเรียนตามคาบ</h1>
            <div className="mt-2 mb-3 h-1 w-16 bg-secondary rounded-full"></div>
            <div className="mb-3">
                <div className="bg-gray-50 border border-line rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-medium text-sm text-text-color font-body">รายละเอียดการเข้าเรียน</h4>
                            <p className="text-sm text-text-color-alt font-body mt-1">
                                ประจำวันที่ {formatDateToThai(date)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="relative overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                        <tr>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                คาบ/เวลา
                            </th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                สถานะการเข้าร่วม
                            </th>
                            <th scope="col" className="px-6 py-3 whitespace-nowrap">
                                จัดการโดย
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {!studingTime.length > 0 && (
                            <tr className="bg-white border-b border-gray-200 text-xs">
                                <td className="px-6 py-4 whitespace-nowrap" colSpan={3}>
                                    ไม่มีคาบเรียนในวันนี้
                                </td>
                            </tr>
                        )}
                        {studingTime.length > 0 && studingTime.map((st, index) => {
                            const isTeacherOpereted = st.attendance?.[0]?.teacher;
                            const isLeaderOpereted = st.attendance?.[0]?.leader;
                            return (
                                <tr key={index} className="bg-white border-b border-gray-200 text-xs">
                                    <th
                                        scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap "
                                    >
                                        คาบที่ {index + 1}  {formatTimeThai(st.timetable.timeStart)} - {formatTimeThai(st.timetable.timeEnd)}
                                    </th>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        { st.attendance.length > 0 ? (
                                            <div
                                                className={`${getAttStatusColor(st.attendance[0].attStatus)} w-fit px-1 py-0.5 rounded-xl text-[10px]`}
                                            >
                                                {formatAttStatus(st.attendance[0].attStatus)} ({formatTimeLocalTh(st.attendance[0].attTimestamp)})
                                            </div>
                                        ) : (
                                            <div
                                                className={`${getAttStatusColor('absent')} w-fit px-1 py-0.5 rounded-xl text-[10px]`}
                                            >
                                                ไม่มีบันทึกการเข้าเรียน
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        { isTeacherOpereted != undefined && `คุณครู ${isTeacherOpereted?.fName} ${isTeacherOpereted?.lName}`}
                                        { isLeaderOpereted != undefined && `${formatTitle(isLeaderOpereted?.student.title)} ${isLeaderOpereted?.student.fName} ${isLeaderOpereted?.student.lName}`}
                                        { isLeaderOpereted == undefined && isTeacherOpereted == undefined && st.attendance.length > 0 &&'ตนเอง'}
                                    </td>
                                </tr>
                            )
                        })}
                        {/* {studingTime.length > 0 && studingTime.map((st, index) => (
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
                        ))} */}
                    </tbody>
                </table>
            </div>
            {/* <div className="grid grid-cols-1 gap-3">
                {studingTime.length > 0 ? studingTime.map((st, key) => (
                    <div key={key}>
                        <h1 className="text-base font-bold text-gray-800 font-heading mb-1">คาบที่ {key + 1} เวลา {formatTimeThai(st.timetable.timeStart)}</h1>
                        <div className="grid grid-cols-1 border border-gray-200 shadow rounded-md w-full">
                            <div className="bg-accent rounded-t-md text-white px-4 py-2">
                                <h2 className="text-lg font-bold ">{st.timetable.subject.subCode} - {st.timetable.subject.subNameThai}</h2>
                                <p className="text-sm text-white/80 mt-1">{st.timetable.subject.subNameEng}</p>
                            </div>
                            <div className="px-4 py-2">
                                <div className="flex items-center text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-gray-500 mr-2">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-gray-500">
                                        {st.attendance.length > 0 ? `ลงชื่อตอน ${formatTimeLocalTh(st.attendance[0].attTimestamp)}` : "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="px-4 py-2 items-center text-sm">
                                <div className="flex items-center text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-gray-500 mr-2">
                                        <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-gray-500">
                                        {st.attendance.length > 0 ? `ลองจิจูด: ${st.attendance[0].longitute} ละติจูด: ${st.attendance[0].latitute}` : '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="px-4 py-2 items-center text-sm">
                                <div className="flex items-center text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-gray-500 mr-2">
                                        <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.536 0l3.878-3.878a2.5 2.5 0 0 0 0-3.536l-7.5-7.5A2.5 2.5 0 0 0 8.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                    </svg>

                                    <p className="text-gray-500">
                                        {st.attendance.length > 0 ? `${formatAttStatus(st.attendance[0].attStatus.toLowerCase())}` : '-'}
                                    </p>

                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 mx-auto text-gray-400 mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                        </svg>
                        <h3 className="text-base font-medium text-gray-900">ไม่มีคาบเรียน</h3>
                    </div>
                )}
            </div> */}

        </div>
    );
};

// ชื่อผู้สอน – ชื่ออาจารย์หรือผู้รับผิดชอบการสอน

// สถานที่เรียน – ห้องเรียนหรืออาคารที่ใช้เรียน

// รายชื่อนักเรียน/นักศึกษา – ผู้เข้าเรียนในคาบนั้น

// สถานะการเข้าเรียน – เช่น มาเรียน, ขาด, มาสาย, ลา

// เวลาเข้า-ออก (ถ้ามี) – บันทึกเวลาจริงที่นักเรียนเข้าและออก

// หมายเหตุเพิ่มเติม – เช่น เหตุผลที่มาสาย, แจ้งล่วงหน้าการลา ฯลฯ

// ลายเซ็น/การยืนยัน – ของนักเรียนหรืออาจารย์ (ถ้าต้องการความเป็นทางการ)

export default AttendenceByDaySummarizeDetail;