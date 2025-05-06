import axios from "axios";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../../config";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
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
    const [studytime, setStudyTime] = useState([]);
    const [filterStudyTime, setFilterStudyTime] = useState([]);
    const location = useLocation();
    const { subject, term } = location.state;
    const [filter, setFilter] = useState('in');

    const formatAttStatus = (status) => {
        switch (status) {
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
        if (filter === 'all') {
            setFilterStudyTime(studytimeClone);
        } else if (filter === 'not-in') {
            const filterNotin = studytimeClone.filter((studytime) => {
                const dtStudytime = DateTime.fromISO(studytime.studingTimeDate).setZone('Asia/Bangkok');
                return dtStudytime > dtNow;
            });
            setFilterStudyTime(filterNotin);
            // console.log(filterNotin);
        } else if (filter === 'in') {
            const filterIn = studytimeClone.filter((studytime) => {
                const dtStudytime = DateTime.fromISO(studytime.studingTimeDate).setZone('Asia/Bangkok');
                return dtStudytime < dtNow;
            });
            setFilterStudyTime(filterIn);
            // console.log(filterIn);
        };
    };


    const handleFilterOnChange = (value) => {
        setFilter(value);
    };

    useEffect(() => {
        handleFilterList(filter);
    }, [filter])

    useEffect(() => {
        callSummarizeStuingTime();
    }, []);

    return (
        <div className="sm:max-w-md md:max-w-lg mx-auto p-2">
            <h1 className="text-2xl font-bold text-accent">การเข้าเรียนตามคาบ</h1>
            <div className="mt-2 mb-3 h-1 w-16 bg-secondary rounded-full"></div>
            <div>
                <h5 className="text-gray-500 font-medium">เมนูฟีลเตอร์</h5>
                <ul className="flex flex-row gap-1.5 text-sm mt-1">
                    <li
                        className={`border px-4 py-1 rounded-full transition-all delay-75 ${filter === 'in' ? ' bg-accent font-medium text-white shadow' : 'border-gray-300'
                            }`}
                        onClick={() => handleFilterOnChange('in')}
                    >
                        คาบเรียนที่เรียนแล้ว
                    </li>
                    {/* <li
                        className={`border px-4 py-1 rounded-full transition-all delay-75 ${filter === 'all' ? ' bg-accent font-medium text-white shadow' : 'border-gray-300'
                            }`}
                        onClick={() => handleFilterOnChange('all')}
                    >
                        ทั้งหมด
                    </li> */}
                    <li
                        className={`border px-4 py-1 rounded-full transition-all delay-75 ${filter === 'not-in' ? ' bg-accent font-medium text-white shadow' : 'border-gray-300'
                            }`}
                        onClick={() => handleFilterOnChange('not-in')}
                    >
                        คาบเรียนที่ยังไม่ถึง
                    </li>
                    
                </ul>
            </div>
            <div className="space-y-4 mt-4">
                {filterStudyTime.length > 0 &&
                    filterStudyTime.map((studytime, index) => (
                        <TapAttendenceSummaryOpen
                            title={`วันที่ ${DateTime.fromISO(
                                        studytime.studingTimeDate
                                    ).setLocale('th').toFormat(`dd/MM/yyyy`)}`}
                            key={index}
                        >
                            <div className="px-6 py-4">                                
                                <p className="text-sm text-gray-600">
                                    เวลา: {studytime.timetable.timeStart} -{" "}
                                    {studytime.timetable.timeEnd}
                                </p>
                                <p className="text-sm text-gray-600">
                                    สายได้ถึง: {studytime.timetable.timeLate}
                                </p>
                                <p className="text-sm text-gray-600">
                                    สถานะการเข้าเรียน:{" "}
                                    {studytime.attendance.length > 0
                                        ? `${formatAttStatus(studytime.attendance[0].attStatus.toLowerCase())}`
                                        : "-"}
                                </p>
                                {

                                }
                            </div>
                        </TapAttendenceSummaryOpen>

                    ))}
            </div>


        </div>
    );
};

export default AttendenceBySubjectSumarizeDetail;