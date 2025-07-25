import axios from "axios";
import React, { useEffect, useState } from "react";
import { HOSTNAME } from "../../config";
import { DateTime } from "luxon";
import { getThaiMonth, weekDayToThaiString } from "../../helper";
import { useNavigate } from "react-router-dom";

function ActivityMainPage() {
    const navigate = useNavigate();
    const dtNow = DateTime.now().setZone('Asia/Bangkok');
    const [activityInThisDay, setActivityInThisDay] = useState([]);
    const [isCheckedIn, setIsCheckedIn] = useState([]);
    const [activity, setActivity] = useState([]);

    const navigateToDetailPage = (activityObject) => {
        navigate('/activity/detail', { state: { activity: activityObject } });
    };

    const isCheckedInActivity = async (activityId) => {
        try {
            const respone = await axios.get(`${HOSTNAME}/s/activity/isCheckin/${activityId}`);
            if (respone.status === 200) {
                return respone.data.isFound;
            } else {
                throw new Error(respone.data.message);
            };
        } catch (error) {
            console.error(error);
        };
    };

    const checkInActivity = async (activity) => {
        try {
            const respone = await axios.post(`${HOSTNAME}/s/activity`, { activity: activity });
            if (respone.status === 200) {
                if (parseInt(respone.data.status) === 1) {
                    alert('บันทึกการเข้าเรียนสำเร็จ');
                    window.location.reload();
                };
            } else {
                throw new Error(respone.data.message);
            }
        } catch (error) {
            console.error(error);
        };
    };

    const formatDate = (date) => {
        const dateformat = DateTime.fromISO(date).setZone('Asia/Bangkok');
        const thMonth = getThaiMonth(dateformat.month);
        return `${dateformat.day} ${thMonth} ${dateformat.year + 543}`
    }

    const isCurrentDateInRange = async (activity) => {
        const activityAttendanceStatus = activity.reduce((accumulator, item) => {
            const activityStartDate = DateTime.fromISO(item.actDate).setZone('Asia/Bangkok');
            const activityEndDate = DateTime.fromISO(item.actDateEnd).setZone('Asia/Bangkok');
            if (dtNow >= activityStartDate && dtNow <= activityEndDate) {
                accumulator.push(item);
            }
            return accumulator;
        }, []);

        const createButtonStatus = Promise.all(activityAttendanceStatus.map(async (act) => {
            const isFound = await isCheckedInActivity(act.actId);
            return isFound;
        }));
        setActivityInThisDay(activityAttendanceStatus);
        setIsCheckedIn(await createButtonStatus);
    };

    const callActivity = async () => {
        try {
            const respone = await axios.get(`${HOSTNAME}/s/activity`)
            if (respone.status === 200) {
                setActivity(respone.data);
                isCurrentDateInRange(respone.data);
            } else {
                throw new Error(respone.data.message);
            };
        } catch (error) {
            console.error(error);
        };
    };

    const isActivityTimeCanEnrollment = (activity) => {
        const startTime = activity.actStartTime.split(':');
        const endTime = activity.actEndTime.split(':');
        const now = DateTime.now();
        const startAct = DateTime.fromISO(`${now.toFormat('yyyy-MM-dd')}T${startTime[0]}:${startTime[1]}:00`)
        const endAct = DateTime.fromISO(`${now.toFormat('yyyy-MM-dd')}T${endTime[0]}:${endTime[1]}:00`)
        if(now >= startAct && now <= endAct) {
            return false;
        }else if(now < startAct && now < endAct) {
            return true;
        }else if(now > startAct && now > endAct) {
            return true;
        }
        // return false;
    };

    useEffect(() => {
        callActivity();
    }, []);

    return (
        <div className="grid grid-cols-1 gap-2 sm:max-w-md md:max-w-lg mx-auto p-4">
            <div>
                <h2 className="text-2xl font-semibold text-left text-primary font-heading">กิจกรรม</h2>
                <div className="mt-2 h-1 w-20 bg-secondary rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <p className=" text-gray-600">
                    {weekDayToThaiString(dtNow.weekday)}, {dtNow.day} {getThaiMonth(dtNow.month)} {dtNow.year + 543}
                </p>
                <div className="flex flex-col">
                    <h5 className="flex gap-1 items-center mb-1 font-bold text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        เช็คชื่อกิจกรรม
                    </h5>
                    {activityInThisDay.length > 0 ? (
                        <div className="grid gap-2">
                            {activityInThisDay.map((act, index) => (
                                <div key={index} className="grid grid-cols-1 border border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden">
                                    <div className="flex justify-between items-center bg-accent px-4 py-2">
                                        <h5 className="text-xl font-semibold text-white ">{act.actName} </h5>
                                        <p className="text-xs text-accent font-bold bg-white px-2 py-1 rounded-xl">
                                            {isActivityTimeCanEnrollment(act) ? 'ผ่านไปแล้ว' : 'กำลังดำเนินการ'}
                                            {/* ผ่านไปแล้ว */}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 px-4 py-3">
                                        <p className="flex items-center gap-2 text-xs text-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-secondary">
                                                <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                                            </svg>
                                            <span>{dtNow.day} {getThaiMonth(dtNow.month)} {dtNow.year + 543}</span>
                                        </p>
                                        <p className="flex items-center gap-2 text-xs text-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-secondary">
                                                <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                                            </svg>
                                            <span>{act.actLocation}</span>
                                        </p>
                                        <p className="flex items-center gap-2 text-xs text-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-secondary">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                                            </svg>
                                            <span>{act.actStartTime}น. - {act.actEndTime}น.</span>
                                        </p>
                                    </div>
                                    { isActivityTimeCanEnrollment(act) ? 
                                        <button
                                            className={`bg-primary text-white font-medium py-1.5 px-2.5 mx-4 mb-4 rounded hover:bg-primary-dark transition duration-300 opacity-50 cursor-not-allowed`}
                                            onClick={() => checkInActivity(act)}
                                            disabled={true}
                                        >
                                            เข้าร่วมกิจกรรม
                                        </button>
                                        :
                                        <button
                                            className={`bg-primary text-white font-medium py-1.5 px-2.5 mx-4 mb-4 rounded hover:bg-primary-dark transition duration-300 ${isCheckedIn[index] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => checkInActivity(act)}
                                            disabled={isCheckedIn[index]}
                                        >
                                            { isCheckedIn[index] ? 'เช็คชื่อเข้าร่วมกิจกรรมแล้ว': 'เข้าร่วมกิจกรรม' }
                                        </button>
                                    }
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-base font-medium text-gray-900">ไม่มีกิจกรรมที่กำลังดำเนินการในขณะนี้</h3>
                            <p className="mt-2 text-gray-500">
                                ไม่มีกิจกรรมอยู่ในช่วงเวลาปัจจุบัน
                            </p>
                        </div>
                    )}

                </div>
            </div>
            <div>
                <h5 className="flex gap-1 items-center mb-1 font-bold text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-primary">
                        <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                    </svg>
                    รายการกิจกรรม
                </h5>
                <div className="grid grid-cols-1 gap-2">
                    {activity.length > 0 ? (
                        <React.Fragment>
                            {activity.map((act, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg bg-white shadow-md p-4">
                                    <h5 className="text-sm font-semibold text-primary mb-2">{act.actName}</h5>
                                    <div className="grid grid-cols-1 gap-2 my-1">
                                        <p className="flex items-center gap-1 text-xs text-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-secondary">
                                                <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                                            </svg>
                                            {formatDate(act.actDate)}
                                        </p>
                                        <p className="flex items-center gap-1 text-xs text-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-secondary">
                                                <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                                            </svg>
                                            {act.actLocation}
                                        </p>
                                    </div>

                                    <button 
                                        className="flex justify-center gap-1 w-full bg-primary text-white font-medium text-xs py-1.5 px-2.5 mt-3 rounded hover:bg-primary-dark transition duration-300"
                                        onClick={() => navigateToDetailPage(act)}
                                    >
                                        ประวัติการเข้าร่วม
                                    </button>
                                </div>
                            ))}
                        </React.Fragment>
                    ) : (
                        <div className="col-span-2 bg-gray-50 rounded-lg p-8 text-center border border-gray-200 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 mx-auto text-gray-400 mb-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                            </svg>
                            <h3 className="text-base font-medium text-gray-900">ไม่มีรายการกิจกรรม</h3>
                            <p className="mt-2 text-gray-500">
                                ไม่มีรายการกิจกรรมหรือคุณอาจไม่มีกิจกรรมที่สามารถเข้าร่วมได้
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityMainPage;