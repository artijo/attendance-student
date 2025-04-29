import { DateTime } from "luxon";
import { getThaiMonth, weekDayToThaiString } from "../../helper";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import EnrollmentCard from "../../components/Attendence/EnrollmentCard";

function StudentAttendence() {
    const [ studingTime, setStudingTime ] = useState([]);
    const dtNow = DateTime.now().setZone("Asia/Bangkok");
    
    const getTimetable = async () => { 
        try{
            const response = await axios.get(`${HOSTNAME}/s/timetable`);
            if(response.status === 200) {
                // return response.data;
                setStudingTime(response.data);
            }else {
                throw new Error("Failed to fetch timetable data");
            };
        }catch(error){
            console.error("Error fetching timetable:", error);
        };
    };

    useEffect(() => {
        getTimetable();
    },[]);

    return (
        <div className="m-4">
            <div className="mb-4">
                <h1 className="text-lg font-medium">เช็คชื่อเข้าเรียน</h1>
                <h4 className="text-3xl font-medium">{weekDayToThaiString(dtNow.weekday)}, {getThaiMonth(dtNow.month)} {dtNow.day} </h4>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4">
                {studingTime.map((item, index) => (
                    <EnrollmentCard key={index} index={index + 1} enrollmentInfo={item} />
                ))}
            </div>
        </div>
    );
};

export default StudentAttendence;