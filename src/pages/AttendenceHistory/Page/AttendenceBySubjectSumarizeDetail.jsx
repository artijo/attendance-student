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

    const [filter, setFilter] = useState({
        startDate: '',
        endDate: ''
    })
    const [studytime, setStudyTime] = useState([]);
    const [filterStudyTime, setFilterStudyTime] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(filterStudyTime.length / itemsPerPage);
    const slicefilterStudyTimeList = filterStudyTime.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const { subject, term } = location.state;

    const handleFilterDate = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setFilter(values => ({ ...values, [name]: value }))
    }

    const handleOnClickAddFilter = (buttonType) => {
        if(buttonType == 'delete') {
            console.log('delete filter');
            setFilter({startDate:'',endDate:''});
            setFilterStudyTime(studytime);
            console.log(studytime);
            return;
        };
        const startDate = DateTime.fromISO(`${filter.startDate}T00:00:00`).setZone('Asia/Bangkok');
        const endDate = DateTime.fromISO(`${filter.endDate}T23:59:00`).setZone('Asia/Bangkok');
        const filterByDate = studytime.filter((value) => {
            const stDate = DateTime.fromISO(value.studingTimeDate).setZone('Asia/Bangkok');
            if(stDate >= startDate && stDate <= endDate){
                return value;
            };
        });
        setFilterStudyTime(filterByDate);
    };

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
        };
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
        const date = DateTime.fromISO(datetime).setLocale('th').toFormat("d LLLL yyyy HH:mm 'น.'")
        return date;
    };

    const callSummarizeStuingTime = async () => {
        try {
            const response = await axios.get(`${HOSTNAME}/s/attendence/history/subjectdetail/${term.termId}/${subject.subId}`);
            if (response.status === 200) {
                setStudyTime(response.data);
                setFilterStudyTime(response.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error(error);
        };
    };

    const getDateFormat = (date) => {
        date = DateTime.fromISO(date).setZone('Asia/Bangkok').toFormat('yyyy-MM-dd');
        // console.log(date);
        return date;
    };


    useEffect(() => {
        callSummarizeStuingTime();
    }, []);


    return (
        <div className="sm:max-w-md md:max-w-lg mx-auto p-2">
            <h1 className="text-2xl font-bold text-accent">การเข้าเรียนตามรายวิชา</h1>
            <div className="mt-2 mb-3 h-1 w-16 bg-secondary rounded-full"></div>
            <div className="mb-3">
                <div className="bg-gray-50 border border-line rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                        <div>
                            <h4 className="font-medium text-sm text-text-color font-body">วิชา {subject.subNameThai} - {subject.subNameEng}({subject.subCode})</h4>
                            <p className="text-sm text-text-color-alt font-body mt-1">
                                คุณครู {subject.teacher.fName} {subject.teacher.lName}<br />
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-2 bg-gray-50 border border-line rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                    <h4 className="font-medium text-sm text-text-color font-body">ตัวกรอง</h4>
                </div>
                <div className="ml-1">
                    <h4 className="font-medium text-xs text-text-color font-body ">วันที่</h4>
                    {studytime.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="date"
                                className="text-xs p-0.5 border border-gray-200 rounded-md"
                                min={
                                    getDateFormat(studytime[0].studingTimeDate)
                                }
                                max={
                                    getDateFormat(studytime[studytime.length - 1].studingTimeDate)
                                }
                                name="startDate"
                                value={filter.startDate}
                                onChange={(e) => handleFilterDate(e)}
                            />
                            <span className="text-xs">ถึง</span>
                            <input
                                type="date"
                                className="text-xs p-0.5 border border-gray-200 rounded-md"
                                disabled={filter.startDate == '' ? true : false}
                                name="endDate"
                                value={filter.endDate}
                                min={
                                    filter.startDate
                                }
                                max={
                                    getDateFormat(studytime[studytime.length - 1].studingTimeDate)
                                }
                                onChange={(e) => handleFilterDate(e)}
                            />
                        </div>
                    )}
                </div>
                <div className="w-fit ml-auto flex gap-2 items-center">
                    <button
                        className="mt-4 md:mt-0 px-2 py-1 text-xs bg-white border border-gray-200 text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        onClick={() => handleOnClickAddFilter('delete')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-1">
                            <path fillRule="evenodd" d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                        </svg>
                        ลบตัวกรอง
                    </button>
                    <button
                        className="mt-4 md:mt-0 px-2 py-1 text-xs bg-primary text-white rounded-lg hover:bg-accent transition-colors flex items-center disabled:bg-blue-300 disabled:hover:bg-blue-300"
                        disabled={filter.startDate != '' && filter.endDate != '' ? false : true}
                        onClick={() => handleOnClickAddFilter('add')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        ใส่ตัวกรอง
                    </button>
                </div>
            </div>
            <div className="mt-4 overflow-auto h-[350px] border border-gray-200 rounded-lg ">
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
                        {slicefilterStudyTimeList.length > 0 && slicefilterStudyTimeList.map((st, index) => {
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
                                        {st.attendance.length == 0 && '-'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            
            {slicefilterStudyTimeList.length > 0 && (
                <div className="mt-2 ml-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="text-sm text-gray-700">
                            แสดง{" "}
                            <span className="font-medium">
                                {(currentPage - 1) * itemsPerPage + 1}
                            </span>{" "}
                            ถึง{" "}
                            <span className="font-medium">
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filterStudyTime.length
                                )}
                            </span>{" "}
                            จาก{" "}
                            <span className="font-medium">
                                {/* {Math.max(
                                    currentPage * itemsPerPage,
                                    studytime.length
                                )} */}
                                {filterStudyTime.length}
                            </span>{" "}
                            รายการ
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${currentPage === 1
                                    ? "border-gray-300 text-gray-500 bg-white cursor-not-allowed"
                                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                                    }`}
                            >
                                <svg
                                    className="h-4 w-4"
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
                                <span className="ml-1 hidden sm:inline">ก่อนหน้า</span>
                            </button>

                            <div className="hidden sm:flex space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((page) => {
                                        return (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        );
                                    })
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                <span className="px-2 py-2 text-gray-500">...</span>
                                            )}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${currentPage === page
                                                    ? "bg-primary border-primary text-white"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${currentPage === totalPages
                                    ? "border-gray-300 text-gray-500 bg-white cursor-not-allowed"
                                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                                    }`}
                            >
                                <span className="mr-1 hidden sm:inline">ถัดไป</span>
                                <svg
                                    className="h-4 w-4"
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
};

export default AttendenceBySubjectSumarizeDetail;