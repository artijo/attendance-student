import { DateTime } from "luxon";
import { getThaiMonth, weekDayToThaiString } from "../../helper";
import axios from "axios";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { useEffect, useState } from "react";
import EnrollmentCard from "../../components/Attendence/EnrollmentCard";

function StudentAttendence() {
    const dtNow = DateTime.now().setZone(TIME_ZONE);
    const [studingTime, setStudingTime] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notPermission, setNotPermission] = useState(false);
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null
    });
    const [isLoading, setIsLoading] = useState(false); // for loading state of the enrollment button waiting for API response
    const [error, setError] = useState(false);
    const [message, setMessage] = useState(null);
    const [successful, setSuccessful] = useState(false);
    const callEnrollmentApi = async (enrollmentInfo, location) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${HOSTNAME}/s/attendence/enrollment`, { enrollmentInfo: enrollmentInfo, location: location });
            if(response.status === 200) {
                setSuccessful(true);
                setMessage(response.data.message);
                setTimeout(() => {
                    setSuccessful(false);
                    setMessage(null);
                    window.location.reload();
                }, 3000);
            }
        } catch (error) {
            const message = error.response.data.message;
            setIsLoading(false);
            setError(true);
            setMessage(message);
            setTimeout(() => {
                setError(false);
                setMessage(null);
            },3000);
        };
    };

    const sortStudyTime = (studyTime) => { // => ฟังก์ชั่นสำหรับ sort ตารางเรียนที่ผ่านไปแล้วให้อยู่หลังสุด 
        const now = DateTime.now();
        const passedStudyTimeArr = studyTime.filter((st) => {
            const stDate = DateTime.fromISO(`${now.toFormat('yyyy-MM-dd')}T${st.timetable.timeStart}`).setZone('Asia/Bangkok');
            const endDate = DateTime.fromISO(`${now.toFormat('yyyy-MM-dd')}T${st.timetable.timeEnd}`).setZone('Asia/Bangkok');
            return now > stDate && now > endDate;
        })
        const notPassedStudtyTimeArr = studyTime.filter((st) => {
            const stDate = DateTime.fromISO(`${now.toFormat('yyyy-MM-dd')}T${st.timetable.timeStart}`).setZone('Asia/Bangkok');
            const endDate = DateTime.fromISO(`${now.toFormat('yyyy-MM-dd')}T${st.timetable.timeEnd}`).setZone('Asia/Bangkok');
            // console.log(stDate);
            return now >= stDate && now <= endDate;
        });
        // console.log(notPassedStudtyTimeArr);
        return [...notPassedStudtyTimeArr, ...passedStudyTimeArr];
    };

    const getTimetable = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${HOSTNAME}/s/timetable`);
            if (response.status === 200) {
                setStudingTime(
                    sortStudyTime(response.data)
                );
            }
        } catch (error) {
            setLoading(false);
        } finally {
            setLoading(false);
        };
    };

    const getLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            if (position.coords) {
                // console.log(position.coords);
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
            }
        })
    }

    const handleLocationPermission = async () => {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "granted") {
            getLocation();
            setNotPermission(false);
        } else if (permission.state === "prompt") {
            getLocation();
            setNotPermission(false);
        } else if (permission.state === "denied") {
            setNotPermission(true);
        }
    }

    useEffect(() => {
        handleLocationPermission();
    }, [])

    useEffect(() => {
        if (location.latitude && location.longitude) {
            getTimetable();
        };
    }, [location.latitude, location.longitude])

    const ErrorAlertDialog = ({ message }) => {
        return (
             <div role="alert" className=" rounded-md border border-red-100 bg-red-100 p-4">
                <div className="flex flex-col items-start relative">
                    <div className="flex  items-start gap-4 mt-2">
                        <span className="text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                            </svg>
                        </span>
                        <div className="flex-1">
                            <strong className="block font-medium text-red-600">เกิดข้อผิดพลาด</strong>
                        </div>

                    </div>
                    <p className="mt-2 ml-1 text-xs text-red-600 ">{message}</p>
                </div>
            </div>
        );
    }

    const SucessfullAlertDialog = ({ message }) => {
        return (
            <div role="alert" className="rounded-md border border-green-100 bg-green-100 p-4">
            <div className="flex flex-col items-start relative">
                <div className="flex items-start gap-4 mt-2">
                <span className="text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path fillRule="evenodd" d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zm4.03 6.97a.75.75 0 0 0-1.06-1.06l-4.22 4.22-1.72-1.72a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.75-4.75z" clipRule="evenodd" />
                    </svg>
                </span>
                <div className="flex-1">
                    <strong className="block font-medium text-green-600">สำเร็จ</strong>
                </div>
                </div>
                <p className="mt-2 ml-1 text-xs text-green-600">{message}</p>
            </div>
            </div>
        );
    }

    if (notPermission) {
        return (
            <div className="m-4">
                <div className="mb-4">
                    <h1 className="text-lg font-medium text-accent">เช็คชื่อเข้าเรียน</h1>
                    <h4 className="text-3xl font-medium">{weekDayToThaiString(dtNow.weekday)}, {getThaiMonth(dtNow.month)} {dtNow.day} </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 border border-gray-200 rounded-xl shadow-md p-5">
                    <div className="flex gap-2 items-center">
                        <div className="bg-white rounded-md text-red-500 shadow p-2 w-fit ">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                        </div>
                        <h5 className="font-bold text-lg text-slate-900">เกิดข้อผิดพลาดเกี่ยวการเข้าถึงต่ำแหน่งของผู้ใช้</h5>
                    </div>
                    <div>
                        <h5 className=" font-bold text-lg text-slate-900">รายละเอียด</h5>
                        <p className="text-sm indent-8 mt-2">
                            ไม่สามารถเข้าถึงตำแหน่งที่ตั้งของคุณได้ เนื่องจากคุณยังไม่ได้อนุญาต หรือระบบปฏิเสธการขอใช้ตำแหน่ง กรุณากดปุ่มด้านล่างเพื่อขออนุญาตใหม่อีกครั้ง
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div className="fixed top-1/2 left-1/2 p-5 -translate-y-1/2 -translate-x-1/2 w-4/4 z-20">
                    <ErrorAlertDialog message={message}/>
                </div>
            )}
            {successful && (
                <div className="fixed top-1/2 left-1/2 p-5 -translate-y-1/2 -translate-x-1/2 w-4/4 z-20">
                    <SucessfullAlertDialog message={message}/>
                </div>
            )}
            <div className="sm:max-w-md md:max-w-lg mx-auto p-2">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                        เช็คชื่อเข้าเรียน
                    </h1>
                    <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
                    <p className="mt-3 text-gray-600">
                        {weekDayToThaiString(dtNow.weekday)}, {dtNow.day} {getThaiMonth(dtNow.month)} {dtNow.year + 543}
                    </p>
                </div>
                {location.latitude && location.longitude && (
                    <div>
                        {studingTime.length > 0 ? (
                            <div>
                                <div className="mb-4 grid grid-cols-1 gap-4">
                                    {studingTime.map((item, index) => (
                                        <EnrollmentCard key={index} index={index + 1} enrollmentInfo={item} callEnrollmentApi={() => callEnrollmentApi(item, location)}  isError = {error} isLoading={isLoading}/>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4 grid grid-cols-1 gap-4">
                                    <p className="text-center text-gray-500">ไม่มีข้อมูลการเรียนในวันนี้</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

    );
};

export default StudentAttendence;