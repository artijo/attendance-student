import { DateTime } from "luxon";
import { getThaiMonth, weekDayToThaiString } from "../../helper";
import axios from "axios";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { useEffect, useState } from "react";
import EnrollmentCard from "../../components/Attendence/EnrollmentCard";

function StudentAttendence() {
    const dtNow = DateTime.now().setZone(TIME_ZONE);
    const [studingTime, setStudingTime] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notPermission, setNotPermission] = useState(false);
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null
    });

    const callEnrollmentApi = async (enrollmentInfo, location) => {
        try {
            const response = await axios.post(`${HOSTNAME}/s/attendence/enrollment`, { enrollmentInfo: enrollmentInfo, location: location });
            if (response.status === 200) {
                console.log(response.data);
                window.location.reload();
            } else {
                throw new Error(response.data.message);
            };
        } catch (error) {
            console.error("Error calling enrollment API:", error);
        };
    };

    const getTimetable = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${HOSTNAME}/s/timetable`);
            if (response.status === 200) {
                setStudingTime(response.data);
            } else {
                throw new Error("Failed to fetch timetable data");
            };
        } catch (error) {
            setLoading(false);
            console.error("Error fetching timetable:", error);
        } finally {
            setLoading(false);
        };
    };

    const getLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            if (position.coords) {
                console.log(position.coords);
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
            }
        })
    }

    const handleLocationPermission = async () => {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if(permission.state === "granted"){
            getLocation();
            setNotPermission(false);
        }else if (permission.state === "prompt") {
            getLocation();
            setNotPermission(false);
        }else if (permission.state === "denied") {
            setNotPermission(true);
        }
    }

    useEffect(() => {
        handleLocationPermission();
    }, [])

    useEffect(() => {
        if(location.latitude && location.longitude) {
            getTimetable();
        };
    },[location.latitude, location.longitude])


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
        ) ;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="sm:max-w-md md:max-w-lg mx-auto p-2">
            <div className="mb-4">
                <h1 className="text-lg font-medium text-accent">เช็คชื่อเข้าเรียน</h1>
                <h4 className="text-3xl font-medium">{weekDayToThaiString(dtNow.weekday)}, {getThaiMonth(dtNow.month)} {dtNow.day}</h4>
            </div>
            {location.latitude && location.longitude && (
                <div>
                    {studingTime.length > 0 ? (
                        <div>
                            <div className="mb-4 grid grid-cols-1 gap-4">
                                {studingTime.map((item, index) => (
                                    <EnrollmentCard key={index} index={index + 1} enrollmentInfo={item} callEnrollmentApi={() => callEnrollmentApi(item, location)} />
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
    );
};

export default StudentAttendence;