import axios from "axios";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../../config";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { formatTimeThai, formatTitle } from "../../../helper";
// import { TapAttendenceSummaryOpen } from "../../../components/tapAttendenceSummaryOpen";

const TapAttendenceSummaryOpen = ({ children, title, icon }) => {
    const [isTabOpen, setIsTabOpen] = useState(false);
    return (
        <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
            <button
                className={`w-full px-6 py-4 text-left flex justify-between items-center transition-colors duration-200 ${isTabOpen ? 'border-b border-line bg-gray-50' : ''}`}
                onClick={() => setIsTabOpen((prevState) => !prevState)}
            >
                <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${isTabOpen ? 'bg-primary text-white' : 'bg-gray-100 text-primary'}`}>
                        {icon || (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )}
                    </div>
                    <h3 className="font-medium text-text-color text-lg font-heading">{title}</h3>
                </div>
                <div className={`transition-transform duration-300 ${isTabOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-color-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* {isTabOpen[index] && (
                
            )} */}
            <div className={` bg-white animate-fadeIn ${isTabOpen ? "block" : "hidden"}`} >
                {children}
            </div>

        </div>
    );
};

function AttendenceBySubjectSumarizeDetail() {
    const location = useLocation();
    const [studytime, setStudyTime] = useState([]);
    // const subject = studytime[0]?.timetable?.subject;
    const [filterStudyTime, setFilterStudyTime] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(filterStudyTime.length / itemsPerPage);
    const slicefilterStudyTimeList = filterStudyTime.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const { subject, term } = location.state;
    const [filter, setFilter] = useState('in');
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatTimeLocalTh = (datetime) => {
        // console.log(datetime);
        const date = DateTime.fromISO(datetime).setLocale('th').toFormat("d LLLL yyyy HH:mm 'น.'")
        return date;
    };

    const callSummarizeStuingTime = async () => {
        try {
            const response = await axios.get(`${HOSTNAME}/s/attendence/history/subjectdetail/${term.termId}/${subject.subId}`);
            if (response.status === 200) {
                setStudyTime(response.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error(error);
        };
    };

    const handleFilterList = (filter) => {
        const studytimeClone = [...studytime];
        const dtNow = DateTime.now().setZone('Asia/Bangkok');
        if (filter === 'not-in') {
            const filterNotin = studytimeClone.filter((studytime) => {
                const dtStudytime = DateTime.fromISO(studytime.studingTimeDate).setZone('Asia/Bangkok');
                return dtStudytime > dtNow;
            });

            setFilterStudyTime(filterNotin);
        } else if (filter === 'in') {
            const filterIn = studytimeClone.filter((studytime) => {
                const dtStudytime = DateTime.fromISO(studytime.studingTimeDate).setZone('Asia/Bangkok');
                // console.log(`${dtStudytime < dtNow} ${studytime.studyTimeId}`);
                return dtStudytime < dtNow;
            });
            // console.log(filterIn)
            setFilterStudyTime(filterIn);
        };
    };


    const handleFilterOnChange = (value) => {
        setFilter(value);
        handleFilterList(value);
    };

    useEffect(() => {
        callSummarizeStuingTime();
    }, []);

    useEffect(() => {
        handleFilterList(filter);
    }, [studytime])

    return (
        <div className="sm:max-w-md md:max-w-lg mx-auto p-2">
            <h1 className="text-2xl font-bold text-accent">การเข้าเรียนตามรายวิชา</h1>
            <div className="mt-2 mb-3 h-1 w-16 bg-secondary rounded-full"></div>
            <div className="mb-3">
                <div className="bg-gray-50 border border-line rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg> */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>

                        <div>
                            <h4 className="font-medium text-sm text-text-color font-body">วิชา {subject.subNameThai} - {subject.subNameEng}({subject.subCode})</h4>
                            <p className="text-sm text-text-color-alt font-body mt-1">
                                คุณครู {subject.teacher.fName} {subject.teacher.lName}<br/>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div>
                    <h5 className="text-gray-500 font-medium">ฟีลเตอร์</h5>
                    <ul className="flex flex-row gap-1.5 text-sm mt-1">
                        <li
                            className={`cursor-pointer border px-4 py-1 rounded-full transition-all delay-75 ${filter === 'in' ? ' bg-accent border-accent font-medium text-white shadow' : 'border-gray-300'
                                }`}
                            onClick={() => handleFilterOnChange('in')}
                        >
                            คาบเรียนที่เรียนแล้ว
                        </li>
                        <li
                            className={`cursor-pointer border px-4 py-1 rounded-full transition-all delay-75 ${filter === 'not-in' ? ' bg-accent border-accent font-medium text-white shadow' : 'border-gray-300'
                                }`}
                            onClick={() => handleFilterOnChange('not-in')}
                        >
                            คาบเรียนที่ยังไม่ถึง
                        </li>
                    </ul>
                </div>
            </div>
            <div className="mt-4 overflow-auto h-[350px]">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="rel text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="bg-gray-50 px-6 py-3 whitespace-nowrap sticky top-0">
                                คาบที่/วันที่
                            </th>
                            <th scope="col" className="bg-gray-50 px-6 py-3 whitespace-nowrap sticky top-0">
                                สถานะการเข้าร่วม
                            </th>
                            <th scope="col" className="bg-gray-50 px-6 py-3 whitespace-nowrap sticky top-0">
                                จัดการโดย
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {slicefilterStudyTimeList.length === 0 && (
                            <tr className="bg-white border-b border-gray-200 text-xs">
                                <td className="px-6 py-4 whitespace-nowrap" colSpan={3}>
                                    วิชานี้ไม่มีคาบเรียน
                                </td>
                            </tr>
                        )}
                        {slicefilterStudyTimeList.length > 0 && slicefilterStudyTimeList.map((st,index) => {
                            const isTeacherOpereted = st.attendance?.[index]?.teacher;
                            const isLeaderOpereted = st.attendance?.[index]?.leader;
                            let startIndex = studytime.findIndex((value) => value.studyTimeId == st.studyTimeId) + 1;
                            return (
                                <tr key={`คาบที่ ${startIndex}`} className="bg-white border-b border-gray-200 text-xs">
                                    <th
                                        scope="row"
                                        className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap "
                                    >
                                        คาบที่ {startIndex} - {formatTimeLocalTh(st.studingTimeDate)}
                                    </th>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {st.attendance.length > 0 ? (
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
                                        {isTeacherOpereted != undefined && `คุณครู ${isTeacherOpereted?.fName} ${isTeacherOpereted?.lName}`}
                                        {isLeaderOpereted != undefined && `${formatTitle(isLeaderOpereted?.student.title)} ${isLeaderOpereted?.student.fName} ${isLeaderOpereted?.student.lName}`}
                                        {isLeaderOpereted == undefined && isTeacherOpereted == undefined && st.attendance.length > 0 && 'ตนเอง'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            {slicefilterStudyTimeList.length > 0 && (
                <div className="border-t border-line px-6 py-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-text-color-alt">
                            แสดง <span className="font-medium text-text-color">{slicefilterStudyTimeList.length}</span> จาก <span className="font-medium text-text-color">{slicefilterStudyTimeList.length}</span> รายการ
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
    );
};

export default AttendenceBySubjectSumarizeDetail;